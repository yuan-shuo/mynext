"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmailChangeLink } from "@/lib/email";
import { ErrorCode, ErrorMessage } from "@/lib/errors";
import { getTokenEmail, cleanToken } from "@/lib/verification-token";
import { rlChangeEmail } from "@/ratelimit/auth";

export type ChangeEmailState = {
  errorCode?: string;
  error?: string;
  success?: boolean;
} | null;

export async function sendChangeEmailLink(
  prevState: ChangeEmailState,
  formData: FormData
): Promise<ChangeEmailState> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      errorCode: ErrorCode.UNAUTHORIZED,
      error: ErrorMessage[ErrorCode.UNAUTHORIZED],
    };
  }

  //     限流
  // ============
  const rateLimitResult = await rlChangeEmail(session.user.id);
  if (!rateLimitResult.success) {
    return {
      errorCode: ErrorCode.TOO_MANY_REQUEST,
      error: ErrorMessage[ErrorCode.TOO_MANY_REQUEST],
    };
  }
  // ============

  // ** 表单数据提取
  const newEmail = formData.get("newEmail") as string;

  if (!newEmail) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return {
      errorCode: ErrorCode.INVALID_EMAIL,
      error: ErrorMessage[ErrorCode.INVALID_EMAIL],
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    if (existingUser.id === session.user.id) {
      return {
        errorCode: ErrorCode.EMAIL_SAME,
        error: ErrorMessage[ErrorCode.EMAIL_SAME],
      };
    }
    return {
      errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
      error: ErrorMessage[ErrorCode.EMAIL_ALREADY_EXISTS],
    };
  }

  // 发送验证邮件
  try {
    await sendEmailChangeLink(newEmail, session.user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }

  return { success: true };
}

export async function confirmEmailChange(token: string, userId: string) {
  // 获取token对应邮箱
  const redisEmail = await getTokenEmail(token);
  // 若此数据在 redis 中不存在，返回错误
  if (!redisEmail) {
    return {
      errorCode: ErrorCode.LINK_INVALID,
      error: ErrorMessage[ErrorCode.LINK_INVALID],
    };
  }

  const newEmail = redisEmail;

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser && existingUser.id !== userId) {
    return {
      errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
      error: ErrorMessage[ErrorCode.EMAIL_ALREADY_EXISTS],
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      emailVerified: new Date(), // 既然已经通过邮件确认，那么就不再需要二次验证邮箱了，只需要更新验证时间
    },
  });

  await cleanToken(newEmail);

  return { success: true };
}
