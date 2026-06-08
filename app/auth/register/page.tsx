"use client"

import { register } from "@/app/actions/auth"
import { useActionState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  if (state?.success) {
    return (
      <div>
        <h1>验证邮件已发送</h1>
        <p>我们向 <strong>{state.email}</strong> 发送了一封验证邮件。</p>
        <p>请点击邮件中的链接完成注册。</p>
        <p>链接 24 小时内有效。</p>
        <br />
        <p>
          <Link href="/auth/login">返回登录</Link>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction}>
      <div>
        <label>邮箱</label>
        <input 
          name="email" 
          type="email" 
          defaultValue={state?.email || ""}
          required 
          disabled={isPending} 
        />
      </div>
      <div>
        <label>密码</label>
        <input 
          name="password" 
          type="password" 
          required 
          disabled={isPending} 
        />
      </div>
      {state?.error && <p>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "注册中..." : "注册"}
      </button>
      <p>
        已有账号？ <Link href="/auth/login">立即登录</Link>
      </p>
    </form>
  )
}