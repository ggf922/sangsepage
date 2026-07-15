-- ============================================================
-- 관리자 계정 승격 (modoomodoo88@gmail.com)
-- 사용법: 해당 이메일로 먼저 회원가입한 뒤 이 SQL을 Supabase SQL Editor에서 실행
-- ============================================================

-- modoomodoo88@gmail.com 을 관리자로 승격
UPDATE public.users
SET role = 'admin'
WHERE email = 'modoomodoo88@gmail.com';

-- 결과 확인 (실행 후 이 유저의 role이 'admin' 이면 성공)
SELECT id, email, name, role, points, created_at
FROM public.users
WHERE email = 'modoomodoo88@gmail.com';
