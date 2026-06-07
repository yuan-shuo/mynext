'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"

export type RegisterState = {
  error?: string
  success?: boolean
} | null

export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "邮箱和密码不能为空" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "邮箱已被注册" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  redirect("/auth/login")
}