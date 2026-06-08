"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/app/actions/auth"
import Link from "next/link"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null)
  
  // 直接计算，不需要 useEffect
  const isValid = token && email ? true : false

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setState({ error: "两次输入的密码不一致" })
      return
    }
    
    if (password.length < 6) {
      setState({ error: "密码长度至少为 6 位" })
      return
    }
    
    const formData = new FormData()
    formData.append("email", email!)
    formData.append("token", token!)
    formData.append("password", password)
    
    const result = await resetPassword(null, formData)
    setState(result)
    
    if (result?.success) {
      setTimeout(() => router.push("/auth/login"), 2000)
    }
  }

  if (!isValid) {
    return (
      <div>
        <h1>重置密码</h1>
        <p>重置链接无效或已过期</p>
        <p><Link href="/auth/forgot-password">重新请求重置密码</Link></p>
      </div>
    )
  }

  return (
    <div>
      <h1>重置密码</h1>
      
      {state?.success && (
        <div>
          <p>密码重置成功！正在跳转到登录页...</p>
        </div>
      )}
      
      {!state?.success && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>新密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div>
            <label>确认新密码</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          {state?.error && <p>{state.error}</p>}
          <button type="submit">重置密码</button>
        </form>
      )}
    </div>
  )
}