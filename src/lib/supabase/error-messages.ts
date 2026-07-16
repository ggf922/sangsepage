/**
 * Supabase Auth 에러 메시지를 한국어로 변환
 * 사용자 친화적인 안내 메시지 제공
 */

export function translateAuthError(errorMessage: string): string {
  const msg = errorMessage.toLowerCase();

  // 이메일 발송 rate limit (Supabase 기본 SMTP 제한)
  if (msg.includes("email rate limit") || msg.includes("rate limit")) {
    return "이메일 발송 한도를 초과했어요. 잠시 후(약 1시간) 다시 시도하거나, 다른 이메일 주소로 가입해 주세요.";
  }

  // 이미 가입된 이메일
  if (
    msg.includes("already registered") ||
    msg.includes("already exists") ||
    msg.includes("user already registered")
  ) {
    return "이미 가입된 이메일입니다. 로그인 페이지에서 로그인해 주세요.";
  }

  // 잘못된 이메일 형식
  if (
    msg.includes("invalid email") ||
    msg.includes("email address is invalid")
  ) {
    return "이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.";
  }

  // 비밀번호 너무 짧음
  if (
    msg.includes("password should be at least") ||
    msg.includes("password is too short")
  ) {
    return "비밀번호가 너무 짧습니다. 8자 이상 입력해 주세요.";
  }

  // 비밀번호 취약 (Supabase에서 취약한 비밀번호 감지)
  if (msg.includes("weak password") || msg.includes("password is weak")) {
    return "비밀번호가 너무 단순합니다. 영문·숫자·기호를 조합해 주세요.";
  }

  // 로그인 정보 불일치
  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials")
  ) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  // 이메일 미인증
  if (
    msg.includes("email not confirmed") ||
    msg.includes("not verified") ||
    msg.includes("email link is invalid")
  ) {
    return "이메일 인증이 필요합니다. 받은 편지함(스팸함 포함)을 확인해 주세요.";
  }

  // 계정 잠김
  if (msg.includes("too many requests")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  // 네트워크 오류
  if (
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("failed to fetch")
  ) {
    return "네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.";
  }

  // 세션 만료
  if (msg.includes("session") && msg.includes("expired")) {
    return "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.";
  }

  // 사용자 없음
  if (msg.includes("user not found")) {
    return "가입되지 않은 이메일입니다. 회원가입을 먼저 진행해 주세요.";
  }

  // 비밀번호 재설정 - 같은 비밀번호로 변경 시도
  if (
    msg.includes("new password should be different") ||
    msg.includes("same password") ||
    msg.includes("password should be different")
  ) {
    return "이전과 다른 새 비밀번호를 입력해 주세요.";
  }

  // 비밀번호 재설정 - 링크 만료/무효
  if (
    msg.includes("token has expired") ||
    msg.includes("recovery token") ||
    msg.includes("otp_expired")
  ) {
    return "재설정 링크가 만료되었습니다. 새 링크를 다시 요청해 주세요.";
  }

  // 비밀번호 재설정 - 세션 없음
  if (
    msg.includes("auth session missing") ||
    msg.includes("session not found")
  ) {
    return "인증 세션이 없습니다. 재설정 링크를 다시 요청해 주세요.";
  }

  // 그 외 알려지지 않은 에러 — 원문 반환 (개발/디버그용)
  // 프로덕션에서는 아래 주석 해제 고려:
  // return "요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  return errorMessage;
}
