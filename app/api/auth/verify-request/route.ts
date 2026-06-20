// app/api/auth/verify-request/route.ts
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ErrorCode } from "@/lib/errors";
// import redis from "@/lib/redis";
import { cleanToken, getTokenEmail } from "@/lib/verification-token";

const redirectPath: string = `/auth/login?errorCode=${ErrorCode.LINK_INVALID}`;

// 辅助复用函数
async function cleanTokenAndRedirect(email: string) {
  // 任务正常完成，直接清理+重定向
  await cleanToken(email);
  redirect("/auth/login?verified=true");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    redirect(redirectPath);
  }

  // 获取token对应邮箱
  const redisEmail = await getTokenEmail(token);
  // 若此数据在 redis 中不存在，返回错误
  if (!redisEmail) {
    redirect(redirectPath);
  }
  // 若和请求邮箱不一致，返回错误
  if (redisEmail !== email) {
    redirect(redirectPath);
  }

  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { email },
  });
  // 若用户不存在，返回错误
  if (!user) {
    redirect(redirectPath);
  }

  // 检查邮箱是否已验证
  if (user.emailVerified) {
    // 如果已经验证过了，直接清理 Redis token
    await cleanTokenAndRedirect(email);
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await cleanTokenAndRedirect(email);
}
