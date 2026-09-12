import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { isMockModeEnabled } from "@/lib/mock/config";

export default async function Header() {
  if (isMockModeEnabled()) {
    return (
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Log✍️
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              MOCK MODE
            </span>
            <Link
              href="/login"
              className="rounded-full bg-black text-white px-4 py-1.5 text-sm font-medium hover:bg-gray-800"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Log✍️
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link
                href="/write"
                className="rounded-full bg-black text-white px-4 py-1.5 font-medium hover:bg-gray-800"
              >
                새 글 작성
              </Link>
              <Link href="/mypage" className="flex items-center gap-2">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt={username ?? "profile"}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    {username?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-gray-500 hover:text-gray-800"
                >
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-black text-white px-4 py-1.5 font-medium hover:bg-gray-800"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
