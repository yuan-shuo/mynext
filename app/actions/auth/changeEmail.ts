"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmailChangeLink } from "@/lib/email";
import { randomUUID } from "crypto";
import { ErrorCode, ErrorMessage } from "@/lib/errors";

export type ChangeEmailState = {
  errorCode?: string;
  error?: string;
  success?: boolean;
} | null;

export async function sendChangeEmailLink(
  prevState: ChangeEmailState,
  formData: FormData
): Promise<ChangeEmailState> {
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

  const session = await auth();
  if (!session?.user?.id) {
    return {
      errorCode: ErrorCode.UNAUTHORIZED,
      error: ErrorMessage[ErrorCode.UNAUTHORIZED],
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    return {
      errorCode: ErrorCode.EMAIL_ALREADY_EXISTS,
      error: ErrorMessage[ErrorCode.EMAIL_ALREADY_EXISTS],
    };
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: newEmail },
  });

  const token = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: newEmail,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await sendEmailChangeLink(newEmail, token, session.user.id);

  return { success: true };
}

export async function confirmEmailChange(token: string, userId: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!verificationToken) {
    return {
      errorCode: ErrorCode.LINK_INVALID,
      error: ErrorMessage[ErrorCode.LINK_INVALID],
    };
  }

  if (verificationToken.expires < new Date()) {
    return {
      errorCode: ErrorCode.LINK_EXPIRED,
      error: ErrorMessage[ErrorCode.LINK_EXPIRED],
    };
  }

  const newEmail = verificationToken.identifier;

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

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: newEmail,
        token: token,
      },
    },
  });

  return { success: true };
}
