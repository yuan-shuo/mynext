// app/api/auth/verify-request/route.ts
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ErrorCode } from "@/lib/errors";
import redis from "@/lib/redis";

const redirectPath: string = `/auth/login?errorCode=${ErrorCode.LINK_INVALID}`;

// 辅助复用函数
async function cleanTokenAndRedirect(token: string, email: string) {
  // 任务正常完成，直接清理+重定向
  await redis.del(`verification:${token}`);
  await redis.del(`verification:email:${email}`);
  redirect("/auth/login?verified=true");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    redirect(`/auth/login?errorCode=${ErrorCode.LINK_INVALID}`);
  }

  // 获取token对应邮箱
  const redisEmail = await redis.get(`verification:${token}`);
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
    await cleanTokenAndRedirect(token, email);
  }

  // // 用 findFirst 查找（因为只有 token）
  // const verificationToken = await prisma.verificationToken.findFirst({
  //   where: { token },
  // });

  // if (!verificationToken || verificationToken.identifier !== email) {
  //   redirect(`/auth/login?errorCode=${ErrorCode.LINK_INVALID}`);
  // }

  // if (verificationToken.expires < new Date()) {
  //   redirect(`/auth/login?errorCode=${ErrorCode.LINK_EXPIRED}`);
  // }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  await cleanTokenAndRedirect(token, email);

  // // 删除 token（用复合主键）
  // await prisma.verificationToken.delete({
  //   where: {
  //     identifier_token: {
  //       identifier: email,
  //       token: token,
  //     },
  //   },
  // });
}
