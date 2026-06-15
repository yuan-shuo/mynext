"use client";

import { login, resendVerificationEmail } from "@/app/actions/auth";
import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(login, null);
  const [resendState, resendAction, isResending] = useActionState(
    resendVerificationEmail,
    null
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/");
    }
  }, [state, router]);

  const verified = searchParams.get("verified");

  return (
    <div>
      <h1>登录</h1>

      {verified && <p>邮箱验证成功！请登录</p>}

      {state?.error && !state?.needsEmailVerification && <p>{state.error}</p>}

      <form action={formAction}>
        <div>
          <label>邮箱</label>
          <input
            type="email"
            name="email"
            required
            defaultValue={state?.email || ""}
          />
        </div>
        <div>
          <label>密码</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? "登录中..." : "登录"}
        </button>
      </form>

      {state?.needsEmailVerification && state?.email && (
        <div>
          <h3>重新发送验证邮件</h3>
          <form action={resendAction}>
            <input type="hidden" name="email" value={state.email} />
            <p>我们将向 {state.email} 重新发送验证邮件。</p>
            {resendState?.error && <p>{resendState.error}</p>}
            {resendState?.success && <p>验证邮件已重新发送！请查收</p>}
            <div>
              <button type="submit" disabled={isResending}>
                {isResending ? "发送中..." : "确认发送"}
              </button>
            </div>
          </form>
        </div>
      )}

      <p>
        还没有账号？ <Link href="/auth/register">立即注册</Link>
      </p>
      <p>
        <Link href="/auth/forgot-password">忘记密码？</Link>
      </p>
    </div>
  );
}
