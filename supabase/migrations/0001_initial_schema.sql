-- ============================================================
-- SangSePage - Initial Database Schema
-- ============================================================

-- ============ Users (프로필) ============
-- Supabase Auth의 auth.users와 1:1 연동
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 100,
  total_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Templates (스타일 템플릿) ============
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  design_tokens JSONB NOT NULL DEFAULT '{}'::JSONB,
  sections JSONB NOT NULL DEFAULT '[]'::JSONB,
  image_prompts JSONB NOT NULL DEFAULT '{}'::JSONB,
  copy_prompts JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Products (상품) ============
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  origin TEXT,
  price INTEGER,
  sale_channels JSONB DEFAULT '[]'::JSONB,
  ingredients JSONB DEFAULT '[]'::JSONB,
  features JSONB DEFAULT '[]'::JSONB,
  brand_tone TEXT,
  extra_info JSONB DEFAULT '{}'::JSONB,
  images JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Generated Pages (생성된 상세페이지) ============
CREATE TABLE IF NOT EXISTS public.generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'ko' CHECK (language IN ('ko', 'en', 'zh', 'ja')),
  share_id TEXT UNIQUE,
  html_content TEXT,
  html_print TEXT,
  generated_copy JSONB DEFAULT '{}'::JSONB,
  generated_images JSONB DEFAULT '[]'::JSONB,
  edit_count INTEGER NOT NULL DEFAULT 0,
  max_edits INTEGER NOT NULL DEFAULT 3,
  points_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Point Transactions (포인트 거래) ============
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('charge', 'usage', 'refund', 'bonus', 'admin_adjust')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  payment_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Point Packages (충전 상품) ============
CREATE TABLE IF NOT EXISTS public.point_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  points INTEGER NOT NULL,
  price INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_pages_user_id ON public.generated_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_pages_product_id ON public.generated_pages(product_id);
CREATE INDEX IF NOT EXISTS idx_generated_pages_status ON public.generated_pages(status);
CREATE INDEX IF NOT EXISTS idx_generated_pages_share_id ON public.generated_pages(share_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active) WHERE is_active = TRUE;

-- ============ Row Level Security (RLS) ============
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_packages ENABLE ROW LEVEL SECURITY;

-- Users: 본인 프로필만 조회/수정
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Templates: 활성 템플릿은 모두 조회 가능, 관리자만 수정
CREATE POLICY "Anyone can view active templates" ON public.templates
  FOR SELECT USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Only admins can modify templates" ON public.templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Products: 본인 것만 CRUD
CREATE POLICY "Users can view own products" ON public.products
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- Generated Pages: 본인 것만 CRUD (공유 링크는 별도 API로)
CREATE POLICY "Users can view own pages" ON public.generated_pages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pages" ON public.generated_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pages" ON public.generated_pages
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pages" ON public.generated_pages
  FOR DELETE USING (auth.uid() = user_id);

-- Point Transactions: 본인 것만 조회
CREATE POLICY "Users can view own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Point Packages: 모두 조회 가능, 관리자만 수정
CREATE POLICY "Anyone can view active packages" ON public.point_packages
  FOR SELECT USING (is_active = TRUE OR EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Only admins can modify packages" ON public.point_packages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============ Triggers ============
-- 회원가입시 profile 자동 생성 (신규 100P 보너스 지급)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    100
  );
  
  -- 신규가입 보너스 거래 기록
  INSERT INTO public.point_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 100, 100, '🎁 신규가입 축하 보너스');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.generated_pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.generated_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
