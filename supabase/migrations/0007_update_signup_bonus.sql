-- ============================================================
-- Migration 0007: 신규가입 보너스 100P → 50P 조정
-- ============================================================
-- 배경:
--   - 상세페이지 생성 비용이 30P → 45P로 상향됨 (4,500원 ≒ 3$)
--   - 이에 맞춰 신규가입 무료 포인트를 50P로 조정
--     · 1회 무료 생성(45P) + 소액 수정(부분 수정 3P~5P) 여유 확보
-- ============================================================

-- 1) users 테이블 기본값 100 → 50
ALTER TABLE public.users
  ALTER COLUMN points SET DEFAULT 50;

-- 2) 신규가입 트리거 함수 재정의 (지급 포인트 100 → 50, 문구 조정)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    50
  );

  -- 신규가입 보너스 거래 기록
  INSERT INTO public.point_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 50, 50, '🎁 신규가입 축하 보너스 (1회 무료 생성 가능)');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 참고:
--   기존 회원의 포인트는 손대지 않습니다 (이미 100P를 받아 소진 중이거나
--   충전 이력이 있을 수 있음). 신규 가입자부터 50P 지급이 적용됩니다.
