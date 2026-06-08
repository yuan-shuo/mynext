import { Suspense } from "react"
import ResetPasswordForm from "./ResetPasswordForm"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}