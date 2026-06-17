"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <div>
      <h1>找回密码</h1>

      {state?.success && <p>重置链接已发送到你的邮箱，请查收</p>}
      {state?.error && <p>{state.error}</p>}

      <form action={formAction}>
        <div>
          <label>邮箱</label>
          <input name="email" type="email" required disabled={isPending} />
        </div>
        <button type="submit" disabled={isPending}>
          发送重置链接
        </button>
      </form>

      <p>
        <Link href="/auth/login">返回登录</Link>
      </p>
    </div>
  );
}
