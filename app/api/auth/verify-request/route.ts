// app/api/auth/verify-request/route.ts
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ErrorCode } from "@/lib/errors"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  
  if (!token || !email) {
    redirect(`/auth/login?errorCode=${ErrorCode.LINK_INVALID}`)
  }
  
  // 用 findFirst 查找（因为只有 token）
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  })
  
  if (!verificationToken || verificationToken.identifier !== email) {
    redirect(`/auth/login?errorCode=${ErrorCode.LINK_INVALID}`)
  }
  
  if (verificationToken.expires < new Date()) {
    redirect(`/auth/login?errorCode=${ErrorCode.LINK_EXPIRED}`)
  }
  
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })
  
  // 删除 token（用复合主键）
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      },
    },
  })
  
  redirect("/auth/login?verified=true")
}