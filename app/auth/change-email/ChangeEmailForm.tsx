"use client";

import { useActionState } from "react";
import { sendChangeEmailLink } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ChangeEmailForm() {
  const searchParams = useSearchParams();
  const urlSuccess = searchParams.get("success");
  const urlError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(
    sendChangeEmailLink,
    null
  );

  if (urlSuccess) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>邮箱更换成功！请使用新邮箱登录</p>
        <p>
          <Link href="/auth/login">返回登录</Link>
        </p>
      </div>
    );
  }

  if (urlError) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>{urlError}</p>
        <p>
          <Link href="/auth/change-email">重新换绑</Link>
        </p>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>验证链接已发送到新邮箱，请查收</p>
        <p>点击邮件中的链接完成换绑。</p>
        <p>
          <Link href="/">返回首页</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>换绑邮箱</h1>

      <form action={formAction}>
        <div>
          <label>新邮箱</label>
          <input name="newEmail" type="email" required disabled={isPending} />
        </div>
        {state?.error && <p>{state?.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "发送中..." : "发送验证链接"}
        </button>
      </form>
    </div>
  );
}
