// ratelimit/auth.ts
import { rateLimit, RateLimitResult } from "@/ratelimit/base";
import { getClientIP } from "@/ratelimit/utils";

const AUTH_KEY = "auth";

function buildAuthKey(type: string, identifier: string): string {
  return `${AUTH_KEY}:${type}:${identifier}`;
}

// 登录限流（自动获取 IP）
export async function rlLogin(email: string): Promise<RateLimitResult> {
  const ip = await getClientIP();
  const identifier = `${ip}:${email.toLowerCase()}`;
  const key = buildAuthKey("login", identifier);

  return rateLimit({
    key,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
}
