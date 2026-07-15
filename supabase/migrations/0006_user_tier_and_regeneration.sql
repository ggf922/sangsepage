-- ============================================================
-- Self-Critique 자동 적용 3가지 규칙 지원
-- 1) users.tier: 회원 등급 (free / pro) — Pro는 자동 Self-Critique ON
-- 2) generated_pages.regeneration_count / source_page_id: 재생성 추적
-- 3) generated_pages.self_critique_used / premium_requested: 실제 적용 이력
-- ============================================================

-- ---------- users.tier 컬럼 추가 ----------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free'
  CHECK (tier IN ('free', 'pro'));

COMMENT ON COLUMN public.users.tier IS
  'free: 기본 요금제 | pro: 프리미엄 요금제(Self-Critique 자동 적용)';

-- ---------- generated_pages: 재생성/프리미엄 추적 컬럼 ----------
ALTER TABLE public.generated_pages
  ADD COLUMN IF NOT EXISTS regeneration_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.generated_pages
  ADD COLUMN IF NOT EXISTS source_page_id UUID REFERENCES public.generated_pages(id) ON DELETE SET NULL;

ALTER TABLE public.generated_pages
  ADD COLUMN IF NOT EXISTS self_critique_used BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.generated_pages
  ADD COLUMN IF NOT EXISTS premium_requested BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.generated_pages.regeneration_count IS
  '이 페이지가 몇 번째 재생성 결과인지 (0=최초 생성, 1=1차 재생성...)';

COMMENT ON COLUMN public.generated_pages.source_page_id IS
  '재생성 시 어떤 페이지에서 파생됐는지 (재생성 시 자동 Self-Critique ON 판단용)';

COMMENT ON COLUMN public.generated_pages.self_critique_used IS
  '이 페이지 생성 시 Self-Critique 2-pass가 실제로 적용됐는지';

COMMENT ON COLUMN public.generated_pages.premium_requested IS
  '사용자가 고급 모드(+15P) 체크박스를 명시적으로 선택했는지';

-- ---------- 인덱스: 재생성 추적용 ----------
CREATE INDEX IF NOT EXISTS idx_generated_pages_source
  ON public.generated_pages(source_page_id);

-- ---------- 검증 SELECT ----------
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'users' AND column_name = 'tier')
    OR (table_name = 'generated_pages' AND column_name IN (
      'regeneration_count', 'source_page_id',
      'self_critique_used', 'premium_requested'
    ))
  )
ORDER BY table_name, column_name;
