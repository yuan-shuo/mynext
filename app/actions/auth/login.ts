'use server'

import { signIn } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { ErrorCode, ErrorMessage } from "@/lib/errors"

export type LoginState = {
  errorCode?: string
  error?: string
  success?: boolean
} | null

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return {
      errorCode: ErrorCode.USER_NOT_FOUND,
      error: ErrorMessage[ErrorCode.USER_NOT_FOUND],
    }
  }

  if (!user.password) {
    return {
      errorCode: ErrorCode.THIRD_PARTY_ONLY,
      error: ErrorMessage[ErrorCode.THIRD_PARTY_ONLY],
    }
  }

  if (!user.emailVerified) {
    return {
      errorCode: ErrorCode.EMAIL_NOT_VERIFIED,
      error: ErrorMessage[ErrorCode.EMAIL_NOT_VERIFIED],
    }
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return {
      errorCode: ErrorCode.INVALID_PASSWORD,
      error: ErrorMessage[ErrorCode.INVALID_PASSWORD],
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    return {
      errorCode: ErrorCode.INVALID_PASSWORD,
      error: ErrorMessage[ErrorCode.INVALID_PASSWORD],
    }
  }
}