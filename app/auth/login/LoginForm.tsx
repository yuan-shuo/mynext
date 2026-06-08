"use client"

import { login, resendVerificationEmail } from "@/app/actions/auth"
import { useActionState, useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ErrorCode, ErrorMessage } from "@/lib/errors"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, formAction, isPending] = useActionState(login, null)
  const [resendState, resendAction, isResending] = useActionState(resendVerificationEmail, null)
  const [showResendForm, setShowResendForm] = useState(false)
  const [currentEmail, setCurrentEmail] = useState("")
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  const verified = searchParams.get("verified")
  const errorCode = searchParams.get("errorCode") as keyof typeof ErrorMessage | null

  useEffect(() => {
    if (state?.errorCode === ErrorCode.EMAIL_NOT_VERIFIED) {
      const emailValue = emailInputRef.current?.value || ""
      setCurrentEmail(emailValue)
      setShowResendForm(true)
    }
  }, [state?.errorCode])

  const getErrorMessage = (code: keyof typeof ErrorMessage) => {
    return ErrorMessage[code] || "发生错误"
  }

  return (
    <div>
      <h1>登录</h1>
      
      {verified && <p>邮箱验证成功！请登录</p>}
      {errorCode && <p>{getErrorMessage(errorCode)}</p>}
      
      <form action={formAction}>
        <div>
          <label>邮箱</label>
          <input 
            ref={emailInputRef}
            type="email" 
            name="email" 
            required 
            defaultValue={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
          />
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

      {showResendForm && (
        <div>
          <h3>重新发送验证邮件</h3>
          <form action={resendAction}>
            <input type="hidden" name="email" value={currentEmail} />
            <p>我们将向 {currentEmail} 重新发送验证邮件。</p>
            {resendState?.error && <p>{resendState.error}</p>}
            {resendState?.success && <p>验证邮件已重新发送！请查收</p>}
            <div>
              <button type="submit" disabled={isResending}>
                {isResending ? "发送中..." : "确认发送"}
              </button>
              <button type="button" onClick={() => setShowResendForm(false)}>
                取消
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
  )
}