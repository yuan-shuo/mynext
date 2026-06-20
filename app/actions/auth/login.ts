"use server";

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ErrorCode, ErrorMessage } from "@/lib/errors";

export type LoginState = {
  errorCode?: string;
  error?: string;
  success?: boolean;
  needsEmailVerification?: boolean;
  email?: string;
} | null;

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      errorCode: ErrorCode.MISSING_FIELDS,
      error: ErrorMessage[ErrorCode.MISSING_FIELDS],
      email: email,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      errorCode: ErrorCode.LOGIN_FAILED,
      error: ErrorMessage[ErrorCode.LOGIN_FAILED],
      email: email,
    };
  }

  if (!user.password) {
    return {
      errorCode: ErrorCode.THIRD_PARTY_ONLY,
      error: ErrorMessage[ErrorCode.THIRD_PARTY_ONLY],
      email: email,
    };
  }

  if (!user.emailVerified) {
    return {
      errorCode: ErrorCode.EMAIL_NOT_VERIFIED,
      error: ErrorMessage[ErrorCode.EMAIL_NOT_VERIFIED],
      needsEmailVerification: true,
      email: email,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch {
    return {
      errorCode: ErrorCode.LOGIN_FAILED,
      error: ErrorMessage[ErrorCode.LOGIN_FAILED],
      email: email,
    };
  }
}
