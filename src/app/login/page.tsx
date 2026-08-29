import Link from "next/link";
import { signInWithPassword } from "@/lib/actions/auth";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">로그인</h1>
        <p className="text-gray-500 mb-8 text-center">
          이메일과 비밀번호로 로그인하세요
        </p>

        <AuthForm mode="login" action={signInWithPassword} />

        <p className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-black underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
