"use client"

import { register } from "@/app/actions/auth"
import { useActionState } from "react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <form action={formAction}>
      <div>
        <label>邮箱</label>
        <input name="email" type="email" required disabled={isPending} />
      </div>
      <div>
        <label>密码</label>
        <input name="password" type="password" required disabled={isPending} />
      </div>
      {state?.error && <p>{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "注册中..." : "注册"}
      </button>
    </form>
  )
}