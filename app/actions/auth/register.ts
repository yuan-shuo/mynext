'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { sendVerificationEmail } from "@/lib/email"
import { randomUUID } from "crypto"
import { ErrorCode, ErrorMessage } from "@/lib/errors"

export type RegisterState = {
  errorCode?: string
  error?: string
  success?: boolean
  email?: string
} | null

export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // 字段缺失
  if (!email || !password) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    }
  }

  // 邮箱格式校验
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      errorCode: ErrorCode.INVALID_EMAIL,
      error: ErrorMessage[ErrorCode.INVALID_EMAIL],
    }
  }

  // 密码长度校验
  if (password.length < 6) {
    return {
      errorCode: ErrorCode.WEAK_PASSWORD,
      error: ErrorMessage[ErrorCode.WEAK_PASSWORD],
    }
  }

  // 检查用户是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return {
      errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
      error: ErrorMessage[ErrorCode.EMAIL_ALREADY_EXISTS],
    }
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10)

  // 创建用户（未验证）
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      emailVerified: null,
    },
  })

  // 生成验证 token
  const token = randomUUID()
  
  // 保存到 VerificationToken 表
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  // 发送验证邮件
  await sendVerificationEmail(email, token)

  return { success: true, email }
}