-- ============================================================
-- 0004: 포인트 충전 신청 테이블 (무통장입금 방식)
-- ============================================================
-- 회원이 충전 신청 → 관리자가 입금 확인 후 승인 → 포인트 지급
-- ============================================================

CREATE TABLE IF NOT EXISTS public.charge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.point_packages(id) ON DELETE SET NULL,

  -- 신청 정보
  points INTEGER NOT NULL CHECK (points > 0),          -- 지급될 총 포인트 (기본 + 보너스)
  amount INTEGER NOT NULL CHECK (amount > 0),          -- 입금해야 할 금액 (원)
  depositor_name TEXT NOT NULL,                        -- 입금자명
  contact TEXT,                                        -- 연락처 (선택)
  memo TEXT,                                           -- 회원 메모

  -- 상태 (pending → approved / rejected / cancelled)
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

  -- 관리자 처리 정보
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  admin_memo TEXT,                                     -- 관리자 메모 (거부 사유 등)

  -- 연결 거래 (승인 시 point_transactions 레코드 참조)
  transaction_id UUID REFERENCES public.point_transactions(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_charge_requests_user_id ON public.charge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_charge_requests_status ON public.charge_requests(status);
CREATE INDEX IF NOT EXISTS idx_charge_requests_created_at ON public.charge_requests(created_at DESC);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS trg_charge_requests_updated_at ON public.charge_requests;
CREATE TRIGGER trg_charge_requests_updated_at
  BEFORE UPDATE ON public.charge_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.charge_requests ENABLE ROW LEVEL SECURITY;

-- 본인 신청만 조회 가능
DROP POLICY IF EXISTS "Users can view own charge requests" ON public.charge_requests;
CREATE POLICY "Users can view own charge requests"
  ON public.charge_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- 본인이 신청 가능 (pending 상태로만)
DROP POLICY IF EXISTS "Users can create own charge requests" ON public.charge_requests;
CREATE POLICY "Users can create own charge requests"
  ON public.charge_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- 본인 pending 취소 가능 (status만 cancelled로)
DROP POLICY IF EXISTS "Users can cancel own pending charge requests" ON public.charge_requests;
CREATE POLICY "Users can cancel own pending charge requests"
  ON public.charge_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status IN ('pending', 'cancelled'));

-- 관리자는 전체 조회/수정 가능
DROP POLICY IF EXISTS "Admins can view all charge requests" ON public.charge_requests;
CREATE POLICY "Admins can view all charge requests"
  ON public.charge_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all charge requests" ON public.charge_requests;
CREATE POLICY "Admins can update all charge requests"
  ON public.charge_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.charge_requests IS '포인트 충전 신청 (무통장입금 방식, 관리자 승인 필요)';
COMMENT ON COLUMN public.charge_requests.status IS 'pending | approved | rejected | cancelled';
COMMENT ON COLUMN public.charge_requests.points IS '승인 시 지급될 총 포인트 (기본 + 보너스 포함)';
COMMENT ON COLUMN public.charge_requests.amount IS '실제 입금해야 할 금액 (원)';
