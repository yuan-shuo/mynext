"use client"

import { login } from "@/app/actions/auth"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div>
      <h1>登录</h1>
      <form action={formAction}>
        <div>
          <label>邮箱</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>密码</label>
          <input type="password" name="password" required />
        </div>
        {state?.error && <p>{state.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "登录中..." : "登录"}
        </button>
      </form>
      <p>
        还没有账号？ <Link href="/auth/register">立即注册</Link>
      </p>
    </div>
  )
}