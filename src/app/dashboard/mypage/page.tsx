import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Coins, User, Calendar, TrendingUp } from "lucide-react";
import { formatDate, formatKRW } from "@/lib/utils";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user!.id).single(),
    supabase
      .from("point_transactions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const points = profile?.points ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-3xl font-bold text-ink">
          마이페이지
        </h1>
        <p className="text-muted-foreground">
          내 정보와 포인트를 관리합니다.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="rounded-xl border border-brand/10 bg-white p-6 md:col-span-1">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
            <User className="h-8 w-8" />
          </div>
          <h2 className="mb-1 font-serif text-xl font-bold">
            {profile?.name || "회원"}
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{user!.email}</p>
          <div className="space-y-2 border-t border-brand/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">가입일</span>
              <span>{formatDate(user!.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">권한</span>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                {profile?.role === "admin" ? "관리자" : "일반"}
              </span>
            </div>
          </div>
        </div>

        {/* Points Card */}
        <div className="rounded-xl border border-brand/10 bg-gradient-to-br from-brand to-brand-dark p-6 text-white md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <span className="text-sm font-medium">잔여 포인트</span>
            </div>
            <TrendingUp className="h-5 w-5 opacity-70" />
          </div>
          <div className="mb-6">
            <span className="font-serif text-5xl font-bold">
              {points.toLocaleString()}
            </span>
            <span className="ml-2 text-2xl opacity-80">P</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/mypage/charge"
              className="rounded-lg bg-white py-2.5 text-center text-sm font-medium text-brand hover:bg-yellow-50"
            >
              충전하기
            </Link>
            <Link
              href="/dashboard/mypage/history"
              className="rounded-lg border border-white/30 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10"
            >
              사용 내역
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 rounded-xl border border-brand/10 bg-white p-6">
        <h2 className="mb-4 font-serif text-xl font-bold text-ink">
          최근 포인트 내역
        </h2>
        {!transactions || transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            아직 포인트 내역이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-brand/5 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      tx.amount > 0
                        ? "font-serif text-lg font-bold text-green-600"
                        : "font-serif text-lg font-bold text-destructive"
                    }
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString()}P
                  </p>
                  <p className="text-xs text-muted-foreground">
                    잔액 {tx.balance_after?.toLocaleString()}P
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
