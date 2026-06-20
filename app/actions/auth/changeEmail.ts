"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmailChangeLink } from "@/lib/email";
import { ErrorCode, ErrorMessage } from "@/lib/errors";
import { getTokenEmail, cleanToken } from "@/lib/verification-token";

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

  // await prisma.verificationToken.deleteMany({
  //   where: { identifier: newEmail },
  // });

  // const token = randomUUID();
  // await prisma.verificationToken.create({
  //   data: {
  //     identifier: newEmail,
  //     token,
  //     expires: new Date(Date.now() + 60 * 60 * 1000),
  //   },
  // });

  // // 生成验证 token
  // const token = randomUUID();

  // await cleanAndSetNewToken(token, newEmail);

  // 发送验证邮件
  try {
    await sendEmailChangeLink(newEmail, session.user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }

  // await sendEmailChangeLink(newEmail, token, session.user.id);

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

  // const verificationToken = await prisma.verificationToken.findFirst({
  //   where: { token },
  // });

  // if (!verificationToken) {
  //   return {
  //     errorCode: ErrorCode.LINK_INVALID,
  //     error: ErrorMessage[ErrorCode.LINK_INVALID],
  //   };
  // }

  // if (verificationToken.expires < new Date()) {
  //   return {
  //     errorCode: ErrorCode.LINK_EXPIRED,
  //     error: ErrorMessage[ErrorCode.LINK_EXPIRED],
  //   };
  // }

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
      emailVerified: null,
    },
  });

  await cleanToken(newEmail);

  return { success: true };
}
