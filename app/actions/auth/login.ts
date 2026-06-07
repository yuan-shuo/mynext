'use server'

import { signIn } from "@/lib/auth"

export type LoginState = {
  error?: string
  success?: boolean
} | null

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "邮箱和密码不能为空" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    
    return { success: true }
  } catch (error) {
    return { error: "邮箱或密码错误" }
  }
}