'use server'

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { ErrorCode, ErrorMessage } from "@/lib/errors"

export type ChangePasswordState = {
  errorCode?: string
  error?: string
  success?: boolean
} | null

export async function changePassword(prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const oldPassword = formData.get("oldPassword") as string
  const newPassword = formData.get("newPassword") as string

  if (!oldPassword || !newPassword) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    }
  }

  if (newPassword.length < 6) {
    return {
      errorCode: ErrorCode.WEAK_PASSWORD,
      error: ErrorMessage[ErrorCode.WEAK_PASSWORD],
    }
  }

  // 新旧密码不能相同
  if (oldPassword === newPassword) {
    return {
      errorCode: ErrorCode.PASSWORD_SAME_AS_OLD,
      error: ErrorMessage[ErrorCode.PASSWORD_SAME_AS_OLD],
    }
  }

  const session = await auth()
  if (!session?.user?.id) {
    return {
      errorCode: ErrorCode.UNAUTHORIZED,
      error: ErrorMessage[ErrorCode.UNAUTHORIZED],
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user || !user.password) {
    return {
      errorCode: ErrorCode.USER_NOT_FOUND,
      error: ErrorMessage[ErrorCode.USER_NOT_FOUND],
    }
  }

  const isValid = await bcrypt.compare(oldPassword, user.password)
  if (!isValid) {
    return {
      errorCode: ErrorCode.OLD_PASSWORD_INCORRECT,
      error: ErrorMessage[ErrorCode.OLD_PASSWORD_INCORRECT],
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return { success: true }
}