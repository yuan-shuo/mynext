"use server";

import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { ErrorCode, ErrorMessage } from "@/lib/errors";
import { cleanAndSetNewToken } from "@/lib/verification-token";

export type ResendState = {
  errorCode?: string;
  error?: string;
  success?: boolean;
} | null;

export async function resendVerificationEmail(
  prevState: ResendState,
  formData: FormData
): Promise<ResendState> {
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

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      errorCode: ErrorCode.LOGIN_FAILED,
      error: ErrorMessage[ErrorCode.LOGIN_FAILED],
    };
  }

  if (user.emailVerified) {
    return {
      errorCode: ErrorCode.EMAIL_ALREADY_VERIFIED,
      error: ErrorMessage[ErrorCode.EMAIL_ALREADY_VERIFIED],
    };
  }

  // 生成验证 token
  const token = randomUUID();

  await cleanAndSetNewToken(token, email);

  // 发送验证邮件
  await sendVerificationEmail(email, token);

  // // 删除旧的验证 token
  // await prisma.verificationToken.deleteMany({
  //   where: { identifier: email },
  // });

  // // 生成新的验证 token
  // const token = randomUUID();

  // await prisma.verificationToken.create({
  //   data: {
  //     identifier: email,
  //     token,
  //     expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  //   },
  // });

  // // 发送验证邮件
  // await sendVerificationEmail(email, token);

  return { success: true };
}
