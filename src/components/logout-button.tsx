"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md p-2 text-muted-foreground hover:bg-ivory hover:text-brand"
      title="로그아웃"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
