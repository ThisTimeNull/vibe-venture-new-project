import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

// 클라이언트 컴포넌트(브라우저)에서 사용하는 Supabase 클라이언트
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
