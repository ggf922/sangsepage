-- ============================================================
-- 초기 데이터 삽입: 5가지 스타일 템플릿 + 포인트 충전 상품
-- ============================================================

-- ============ 5가지 템플릿 (A~E) ============
INSERT INTO public.templates (code, name, category, description, design_tokens, sections, is_active)
VALUES
-- A: 김치·식품 (오가미 스타일)
(
  'kimchi-ogami',
  '식품·김치 (오가미 스타일)',
  'food',
  '한국 전통 식품 브랜드에 최적화된 감성적 디자인. 아이보리·브랜드레드·골드 조합의 전통 미감.',
  '{
    "colors": {
      "primary": "#a71d1d",
      "primaryDark": "#8f1717",
      "accent": "#e8c98a",
      "background": "#f4ede0",
      "backgroundLight": "#faf5ea",
      "text": "#2b1f18",
      "textMuted": "#6b5a4d"
    },
    "fonts": {
      "sans": "Noto Sans KR",
      "serif": "Nanum Myeongjo"
    },
    "layout": {
      "width": 860,
      "padding": 60
    }
  }'::JSONB,
  '["hero", "intro", "spec", "points", "korea100", "ingredients", "banner", "process", "signature", "product-info", "shipping", "footer"]'::JSONB,
  TRUE
),
-- B: 생활용품 (모던 미니멀)
(
  'household-modern',
  '생활용품 (모던 미니멀)',
  'household',
  '무인양품 스타일의 미니멀하고 기능적인 디자인. 화이트·블랙·그레이의 절제된 감각.',
  '{
    "colors": {
      "primary": "#2d2d2d",
      "primaryDark": "#000000",
      "accent": "#a3a3a3",
      "background": "#f5f5f5",
      "backgroundLight": "#ffffff",
      "text": "#1a1a1a",
      "textMuted": "#737373"
    },
    "fonts": {
      "sans": "Inter",
      "serif": "Inter"
    },
    "layout": {
      "width": 860,
      "padding": 80
    }
  }'::JSONB,
  '["hero", "intro", "feature-grid", "spec", "usage", "material", "product-info", "shipping", "footer"]'::JSONB,
  TRUE
),
-- C: 전자제품 (테크 프리미엄)
(
  'electronics-tech',
  '전자제품 (테크 프리미엄)',
  'electronics',
  'Apple·Dyson 스타일의 하이테크 프리미엄 감각. 다크 배경에 네온그린 포인트.',
  '{
    "colors": {
      "primary": "#00d47e",
      "primaryDark": "#00a865",
      "accent": "#ffffff",
      "background": "#0a0a0a",
      "backgroundLight": "#1a1a1a",
      "text": "#ffffff",
      "textMuted": "#a3a3a3"
    },
    "fonts": {
      "sans": "Inter",
      "serif": "Inter"
    },
    "layout": {
      "width": 860,
      "padding": 60
    }
  }'::JSONB,
  '["hero-dark", "spec-tech", "feature-tech", "comparison", "usage-video", "product-info", "shipping", "footer-dark"]'::JSONB,
  TRUE
),
-- D: 건강식품 (클린 내추럴)
(
  'health-natural',
  '건강식품 (클린 내추럴)',
  'health',
  '락토핏 스타일의 신뢰감 있는 자연주의 디자인. 세이지그린·베이지·화이트의 부드러운 톤.',
  '{
    "colors": {
      "primary": "#8fa88f",
      "primaryDark": "#6b8e6b",
      "accent": "#d4c19c",
      "background": "#f0ebe0",
      "backgroundLight": "#ffffff",
      "text": "#3d3d3d",
      "textMuted": "#7a7a7a"
    },
    "fonts": {
      "sans": "Noto Sans KR",
      "serif": "Nanum Myeongjo"
    },
    "layout": {
      "width": 860,
      "padding": 60
    }
  }'::JSONB,
  '["hero", "intro", "certification", "ingredients-detail", "benefit", "usage-daily", "clinical", "product-info", "shipping", "footer"]'::JSONB,
  TRUE
),
-- E: 화장품 (럭셔리 뷰티)
(
  'cosmetics-luxury',
  '화장품 (럭셔리 뷰티)',
  'cosmetics',
  '설화수·닥터자르트 스타일의 럭셔리 뷰티 감각. 로즈·골드·크림의 부드러운 럭셔리 톤.',
  '{
    "colors": {
      "primary": "#c9a5a0",
      "primaryDark": "#a08581",
      "accent": "#d4af7c",
      "background": "#faf4ee",
      "backgroundLight": "#ffffff",
      "text": "#3d2828",
      "textMuted": "#8a7373"
    },
    "fonts": {
      "sans": "Noto Sans KR",
      "serif": "Nanum Myeongjo"
    },
    "layout": {
      "width": 860,
      "padding": 60
    }
  }'::JSONB,
  '["hero-luxury", "intro-story", "ingredients-cosmetic", "how-to-use", "before-after", "clinical-cosmetic", "product-info", "shipping", "footer"]'::JSONB,
  TRUE
);

-- ============ 포인트 충전 상품 ============
INSERT INTO public.point_packages (code, name, points, price, bonus_points, display_order)
VALUES
  ('starter', '스타터', 100, 9900, 10, 1),
  ('basic', '베이직', 300, 29000, 50, 2),
  ('pro', '프로', 1000, 90000, 200, 3),
  ('agency', '에이전시', 3500, 290000, 1000, 4);
