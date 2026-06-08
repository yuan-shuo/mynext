'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { ErrorCode, ErrorMessage } from "@/lib/errors"

export type ResetPasswordState = {
  errorCode?: string
  error?: string
  success?: boolean
} | null

export async function resetPassword(prevState: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const email = formData.get("email") as string
  const token = formData.get("token") as string
  const password = formData.get("password") as string

  if (!email || !token || !password) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    }
  }

  if (password.length < 6) {
    return {
      errorCode: ErrorCode.WEAK_PASSWORD,
      error: ErrorMessage[ErrorCode.WEAK_PASSWORD],
    }
  }

  // 验证 token
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  })

  if (!verificationToken || verificationToken.identifier !== email) {
    return {
      errorCode: ErrorCode.LINK_INVALID,
      error: ErrorMessage[ErrorCode.LINK_INVALID],
    }
  }

  if (verificationToken.expires < new Date()) {
    return {
      errorCode: ErrorCode.LINK_EXPIRED,
      error: ErrorMessage[ErrorCode.LINK_EXPIRED],
    }
  }

  // 更新密码
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  // 删除已使用的 token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token: token,
      },
    },
  })

  return { success: true }
}