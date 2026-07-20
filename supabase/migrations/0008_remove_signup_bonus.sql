-- ============================================================
-- Migration 0008: 신규가입 보너스 완전 제거 (50P → 0P)
-- ============================================================
-- 배경:
--   - Gemini API 크레딧 소진 이슈 재발 방지
--   - 1만명 이상 유입 대비 무분별한 무료 크레딧 지급 중단
--   - 신규 회원도 반드시 충전 후 서비스 이용
-- ============================================================

-- 1) users 테이블 기본값 50 → 0
ALTER TABLE public.users
  ALTER COLUMN points SET DEFAULT 0;

-- 2) 신규가입 트리거 함수 재정의 (지급 포인트 완전 제거)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    0
  );

  -- 가입 이벤트만 기록 (포인트 지급 없음)
  -- 트랜잭션 기록도 생성하지 않음 (0P 지급은 의미 없음)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 참고:
--   기존 회원의 포인트는 손대지 않습니다.
--   신규 가입자부터 0P 지급이 적용되며, 서비스 이용을 위해서는
--   반드시 포인트 충전이 필요합니다.
