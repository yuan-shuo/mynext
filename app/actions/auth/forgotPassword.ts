"use server";

import prisma from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/email";
import { randomUUID } from "crypto";
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

  // 删除旧的 token
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // 生成新 token
  const token = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1小时有效
    },
  });

  // 发送重置邮件
  await sendResetPasswordEmail(email, token);

  return { success: true };
}
