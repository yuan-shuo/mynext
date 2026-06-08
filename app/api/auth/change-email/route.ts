import { confirmEmailChange } from "@/app/actions/auth/changeEmail"
import { redirect } from "next/navigation"
import { ErrorCode } from "@/lib/errors"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const userId = searchParams.get("userId")

  if (!token || !userId) {
    redirect(`/auth/change-email?errorCode=${ErrorCode.LINK_INVALID}`)
  }

  const result = await confirmEmailChange(token, userId)

  if (result?.errorCode) {
    redirect(`/auth/change-email?errorCode=${result.errorCode}`)
  }

  redirect("/auth/change-email?success=true")
}