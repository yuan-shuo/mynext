"use server";

import prisma from "@/lib/prisma";
import { sendResetPasswordEmail, sendVerificationEmail } from "@/lib/email";
import { ErrorCode, ErrorMessage } from "@/lib/errors";

export type ForgotPasswordState = {
  errorCode?: string;
  error?: string;
  success?: boolean;
} | null;

export async function forgotPassword(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    };
  }

  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      errorCode: ErrorCode.INVALID_EMAIL,
      error: ErrorMessage[ErrorCode.INVALID_EMAIL],
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // 为了安全，不暴露"邮箱不存在"，统一返回成功
    return { success: true };
  }

  // 如果用户还没验证邮箱，现发送邮箱验证邮件
  if (!user.emailVerified) {
    // 发送验证邮件
    try {
      await sendVerificationEmail(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      return { success: false, error: message };
    }
    return { success: true };
  }

  // 发送重置邮件
  try {
    await sendResetPasswordEmail(email);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }

  return { success: true };
}
