/**
 * Gemini API 키 다중 로테이션 & Failover 매니저
 *
 * ─────────────────────────────────────────────────────────
 * 왜 필요한가?
 * ─────────────────────────────────────────────────────────
 * 단일 API 키 사용 시 크레딧 소진(429) / 할당량 초과(429) 발생하면
 * 서비스가 즉시 중단됨. 복수의 키를 준비하고 실패 시 자동으로
 * 다음 키로 넘어가는 failover 매커니즘을 구현.
 *
 * ─────────────────────────────────────────────────────────
 * 환경 변수 설정 방법 (모두 지원, 하나만 있어도 됨)
 * ─────────────────────────────────────────────────────────
 *   1) GEMINI_API_KEY               (기존 단일 키 - 하위 호환)
 *   2) GEMINI_API_KEYS              (쉼표로 구분된 다중 키)
 *   3) GEMINI_API_KEY_1, _2, _3 ... (번호로 구분된 다중 키)
 *
 * 예시:
 *   GEMINI_API_KEY=AIzaSy...primary
 *   GEMINI_API_KEYS=AIzaSy...backup1,AIzaSy...backup2
 *   GEMINI_API_KEY_3=AIzaSy...backup3
 *
 * ─────────────────────────────────────────────────────────
 * 동작 방식
 * ─────────────────────────────────────────────────────────
 * - 매 요청마다 사용 가능한 키 중 하나를 선택 (round-robin)
 * - 429(quota) / 401(invalid) / 403(forbidden) 응답 시
 *   해당 키를 일정 시간 격리(cool-down) 후 다음 키 시도
 * - 격리 시간: 429=10분, 401/403=1시간
 * - 모든 키가 격리되면 가장 먼저 회복될 키를 강제로 재시도
 * ─────────────────────────────────────────────────────────
 */

interface KeyState {
  key: string;
  index: number; // 표시용 번호 (로그에 사용)
  // 격리 해제 시각 (ms epoch). 0이면 즉시 사용 가능
  cooldownUntil: number;
  // 최근 에러 코드 (디버그용)
  lastErrorStatus: number | null;
  // 사용 횟수 (로드 밸런싱 참고용)
  useCount: number;
}

// 모듈 스코프에 유지 (서버리스 콜드 스타트 시마다 초기화되지만,
// warm 인스턴스에서는 상태가 지속됨 → 짧은 시간 내 429 반복 방지)
let keyStates: KeyState[] | null = null;
let rotationCursor = 0;

const QUOTA_COOLDOWN_MS = 10 * 60 * 1000; // 429: 10분
const AUTH_COOLDOWN_MS = 60 * 60 * 1000; // 401/403: 1시간

/**
 * 환경 변수에서 모든 Gemini API 키를 수집.
 * 중복 제거, 빈 값 필터링.
 */
function loadKeysFromEnv(): string[] {
  const collected: string[] = [];

  // 1) 단일 키
  const single = process.env.GEMINI_API_KEY?.trim();
  if (single) collected.push(single);

  // 2) 쉼표 구분 다중 키
  const csv = process.env.GEMINI_API_KEYS?.trim();
  if (csv) {
    csv.split(",").forEach((k) => {
      const t = k.trim();
      if (t) collected.push(t);
    });
  }

  // 3) 번호 접미사 (_1 ~ _20까지 스캔)
  for (let i = 1; i <= 20; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`]?.trim();
    if (k) collected.push(k);
  }

  // 중복 제거 (동일 키 여러 슬롯에 지정된 경우)
  const unique = Array.from(new Set(collected));
  return unique;
}

function initializeKeyStates(): KeyState[] {
  const keys = loadKeysFromEnv();

  if (keys.length === 0) {
    throw new Error(
      "Gemini API 키가 설정되지 않았습니다. GEMINI_API_KEY, GEMINI_API_KEYS 또는 GEMINI_API_KEY_1..N 중 최소 하나를 설정하세요.",
    );
  }

  return keys.map((key, idx) => ({
    key,
    index: idx + 1,
    cooldownUntil: 0,
    lastErrorStatus: null,
    useCount: 0,
  }));
}

function getKeyStates(): KeyState[] {
  if (!keyStates) {
    keyStates = initializeKeyStates();
    console.log(
      `[Gemini Keys] ${keyStates.length}개의 API 키가 로드되었습니다.`,
    );
  }
  return keyStates;
}

/**
 * 사용 가능한(격리되지 않은) 키 중 하나를 반환.
 * 모두 격리 중이면 가장 먼저 회복될 키를 강제로 반환.
 */
export function pickAvailableKey(): { key: string; index: number; total: number } {
  const states = getKeyStates();
  const now = Date.now();

  // 사용 가능한 키 필터링
  const available = states.filter((s) => s.cooldownUntil <= now);

  if (available.length > 0) {
    // Round-robin: cursor 위치부터 순회하며 available 중 첫 번째 선택
    const total = states.length;
    for (let i = 0; i < total; i++) {
      const idx = (rotationCursor + i) % total;
      const cand = states[idx];
      if (cand.cooldownUntil <= now) {
        rotationCursor = (idx + 1) % total;
        cand.useCount++;
        return { key: cand.key, index: cand.index, total };
      }
    }
  }

  // 모든 키가 격리됨: 가장 빨리 풀리는 키를 강제로 반환
  const soonest = [...states].sort((a, b) => a.cooldownUntil - b.cooldownUntil)[0];
  console.warn(
    `[Gemini Keys] 모든 키가 격리 중입니다. 키 #${soonest.index}를 강제로 시도합니다. (해제까지 ${Math.max(0, soonest.cooldownUntil - now)}ms)`,
  );
  soonest.useCount++;
  return { key: soonest.key, index: soonest.index, total: states.length };
}

/**
 * 해당 키에 문제가 발생했음을 기록하고 격리 시작.
 * @param key 문제가 발생한 API 키
 * @param status HTTP 상태 코드 (429, 401, 403 등)
 */
export function markKeyFailure(key: string, status: number): void {
  const states = getKeyStates();
  const target = states.find((s) => s.key === key);
  if (!target) return;

  const now = Date.now();
  let cooldown = 0;

  if (status === 429) {
    cooldown = QUOTA_COOLDOWN_MS;
  } else if (status === 401 || status === 403) {
    cooldown = AUTH_COOLDOWN_MS;
  } else {
    // 그 외 상태(500, 503 등)는 격리하지 않음 - 재시도 로직이 처리
    return;
  }

  target.cooldownUntil = now + cooldown;
  target.lastErrorStatus = status;

  const availableCount = states.filter((s) => s.cooldownUntil <= now).length;
  console.warn(
    `[Gemini Keys] 키 #${target.index} 격리됨 (status=${status}, ${cooldown / 60000}분). 사용 가능: ${availableCount}/${states.length}`,
  );
}

/**
 * 키 사용 성공을 기록.
 * (현재는 로그만 - 향후 통계용으로 확장 가능)
 */
export function markKeySuccess(key: string): void {
  const states = getKeyStates();
  const target = states.find((s) => s.key === key);
  if (target && target.lastErrorStatus !== null) {
    console.log(`[Gemini Keys] 키 #${target.index} 정상 복구됨.`);
    target.lastErrorStatus = null;
  }
}

/**
 * 현재 키 풀 상태 스냅샷 (관리자 대시보드용).
 */
export function getKeyPoolStatus() {
  const states = getKeyStates();
  const now = Date.now();
  return {
    total: states.length,
    available: states.filter((s) => s.cooldownUntil <= now).length,
    keys: states.map((s) => ({
      index: s.index,
      inCooldown: s.cooldownUntil > now,
      cooldownRemainingMs: Math.max(0, s.cooldownUntil - now),
      lastErrorStatus: s.lastErrorStatus,
      useCount: s.useCount,
    })),
  };
}
