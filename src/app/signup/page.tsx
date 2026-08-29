import Link from "next/link";
import { signUpWithPassword } from "@/lib/actions/auth";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">회원가입</h1>
        <p className="text-gray-500 mb-8 text-center">
          몇 가지 정보만 입력하면 바로 시작할 수 있어요
        </p>

        <AuthForm mode="signup" action={signUpWithPassword} />

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-black underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
