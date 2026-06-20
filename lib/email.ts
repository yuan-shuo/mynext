import nodemailer from "nodemailer";
import redis from "@/lib/redis";
import { randomUUID } from "crypto";
import { cleanAndSetNewToken } from "@/lib/verification-token";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

interface RateLimitResp {
  allow: boolean;
  ttl: number;
}

async function rateLimit(key: string, exp: number): Promise<RateLimitResp> {
  const ttl = await redis.ttl(key);
  if (ttl > 0) {
    return {
      allow: false,
      ttl: ttl,
    };
  }
  await redis.setex(key, exp, 0);
  return {
    allow: true,
    ttl: 0,
  };
}

export async function sendVerificationEmail(email: string) {
  // 发送邮件限流
  const rl = await rateLimit(`ratelimit:sendVerificationEmail:${email}`, 60);
  if (!rl.allow) {
    throw new Error(`发送邮件过于频繁，请 ${rl.ttl} 秒后再试`);
  }

  // 生成验证 token
  const token = randomUUID();
  await cleanAndSetNewToken(token, email);

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify-request?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@localhost",
    to: email,
    subject: "验证你的邮箱",
    html: `
      <h1>欢迎注册！</h1>
      <p>请点击以下链接验证你的邮箱：</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>链接 24 小时内有效。</p>
      <p>如果你没有注册，请忽略这封邮件。</p>
    `,
  });
}

export async function sendResetPasswordEmail(email: string) {
  // 发送邮件限流
  const rl = await rateLimit(`ratelimit:sendResetPasswordEmail:${email}`, 60);
  if (!rl.allow) {
    throw new Error(`发送邮件过于频繁，请 ${rl.ttl} 秒后再试`);
  }

  // 生成验证 token
  const token = randomUUID();
  await cleanAndSetNewToken(token, email);

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@localhost",
    to: email,
    subject: "重置密码",
    html: `
      <h1>重置密码</h1>
      <p>请点击以下链接重置密码：</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>链接 1 小时内有效。</p>
      <p>如果你没有请求重置密码，请忽略这封邮件。</p>
    `,
  });
}

export async function sendEmailChangeLink(email: string, userId: string) {
  // 发送邮件限流
  const rl = await rateLimit(`ratelimit:sendEmailChangeLink:${email}`, 60);
  if (!rl.allow) {
    throw new Error(`发送邮件过于频繁，请 ${rl.ttl} 秒后再试`);
  }

  // 生成验证 token
  const token = randomUUID();
  await cleanAndSetNewToken(token, email);

  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const confirmUrl = `${baseUrl}/api/auth/change-email?token=${token}&userId=${userId}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "noreply@localhost",
    to: email,
    subject: "确认更换邮箱",
    html: `
      <h1>确认更换邮箱</h1>
      <p>请点击以下链接确认更换邮箱：</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
      <p>链接 1 小时内有效。</p>
      <p>如果不是你本人操作，请忽略这封邮件。</p>
    `,
  });
}
