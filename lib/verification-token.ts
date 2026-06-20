import redis from "@/lib/redis";

const expTime = 86400;

// 删除该邮箱旧的 token（如果有）
export async function cleanToken(email: string) {
  const oldToken = await redis.get(`verification:email:${email}`);
  if (oldToken) {
    await redis.del(`verification:${oldToken}`);
    await redis.del(`verification:email:${email}`);
  }
}

// 生成新 token
export async function setToken(token: string, email: string) {
  await redis.setex(`verification:${token}`, expTime, email);
  await redis.setex(`verification:email:${email}`, expTime, token);
}

// 清理旧 token 并生成新 token
export async function cleanAndSetNewToken(token: string, email: string) {
  await cleanToken(email);
  await setToken(token, email);
}

// 获取 token 对应的邮箱
export async function getTokenEmail(token: string) {
  return await redis.get(`verification:${token}`);
}
