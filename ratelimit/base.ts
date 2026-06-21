// ratelimit/base.ts
import redis from "@/lib/redis";

// Redis key 前缀常量
const RATE_LIMIT_PREFIX = "ratelimit:";

// 限流配置选项
export interface RateLimitOptions {
  // 限流键，建议格式：业务前缀:标识符，如 'auth:login:192.168.1.1:user@email.com'
  key: string;
  // 时间窗口内允许的最大请求次数
  limit: number;
  // 时间窗口大小（毫秒）
  windowMs: number;
  // 是否使用滑动窗口（默认 false，使用固定窗口）
  sliding?: boolean;
}

// 限流结果
export interface RateLimitResult {
  // 是否允许本次请求
  success: boolean;
  // 剩余可请求次数
  remaining: number;
  // 当前窗口已用次数
  current: number;
  // 限流重置时间戳（秒）
  resetTime: number;
  // 限流限制总数
  limit: number;
}

// 限流状态（不增加计数）
export interface RateLimitStatus {
  current: number;
  remaining: number;
  resetTime: number;
  limit: number;
}

// 构建完整的 Redis key
function buildRedisKey(key: string): string {
  return `${RATE_LIMIT_PREFIX}${key}`;
}

// 固定窗口限流（默认）
// 使用 INCR + EXPIRE 实现，性能最优
async function fixedWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redisKey = buildRedisKey(key);

  // 使用 MULTI 保证原子性
  const multi = redis.multi();
  multi.incr(redisKey);
  multi.ttl(redisKey);

  const results = await multi.exec();
  if (!results) {
    throw new Error("Redis 执行失败");
  }

  const current = results[0][1] as number;
  const ttl = results[1][1] as number;

  // 如果是第一次请求，设置过期时间
  if (current === 1) {
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
  }

  const success = current <= limit;
  const resetTime =
    Math.floor(Date.now() / 1000) +
    (ttl > 0 ? ttl : Math.ceil(windowMs / 1000));

  return {
    success,
    remaining: Math.max(0, limit - current),
    current,
    resetTime,
    limit,
  };
}

// 滑动窗口限流（更精确）
// 使用 ZSET 存储请求时间戳，精确控制窗口内的请求数
async function slidingWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redisKey = buildRedisKey(key);
  const now = Date.now();
  const windowStart = now - windowMs;
  const member = `${now}-${Math.random().toString(36).substring(2, 10)}`;

  // Lua 脚本保证原子性
  const script = `
    redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
    redis.call('ZADD', KEYS[1], ARGV[2], ARGV[3])
    local count = redis.call('ZCARD', KEYS[1])
    redis.call('EXPIRE', KEYS[1], ARGV[4])
    return count
  `;

  const count = (await redis.eval(
    script,
    1,
    redisKey,
    windowStart,
    now,
    member,
    Math.ceil(windowMs / 1000)
  )) as number;

  const success = count <= limit;
  const ttl = await redis.ttl(redisKey);
  const resetTime =
    Math.floor(Date.now() / 1000) +
    (ttl > 0 ? ttl : Math.ceil(windowMs / 1000));

  return {
    success,
    remaining: Math.max(0, limit - count),
    current: count,
    resetTime,
    limit,
  };
}

// 通用限流函数
// 默认使用固定窗口（性能最优），可选滑动窗口（更精确）
export async function rateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { key, limit, windowMs, sliding = false } = options;

  // 参数校验
  if (limit <= 0) {
    throw new Error("limit 必须大于 0");
  }
  if (windowMs <= 0) {
    throw new Error("windowMs 必须大于 0");
  }
  if (!key) {
    throw new Error("key 不能为空");
  }

  // 根据策略选择实现
  if (sliding) {
    return slidingWindowRateLimit(key, limit, windowMs);
  }
  return fixedWindowRateLimit(key, limit, windowMs);
}

// 获取限流当前状态（不增加计数）
// 用于前端显示剩余次数
export async function getRateLimitStatus(
  key: string
): Promise<RateLimitStatus | null> {
  const redisKey = buildRedisKey(key);
  const [current, ttl] = await Promise.all([
    redis.get(redisKey),
    redis.ttl(redisKey),
  ]);

  if (!current) {
    return null;
  }

  const currentNum = parseInt(current, 10);
  const resetTime = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : 0);

  // 注意：这里无法获取 limit，所以返回 -1 表示未知
  return {
    current: currentNum,
    remaining: Math.max(0, currentNum - 1),
    resetTime,
    limit: -1, // 调用方需要自己维护 limit 值
  };
}

// 重置限流（登录成功后清除计数）
export async function resetRateLimit(key: string): Promise<void> {
  const redisKey = buildRedisKey(key);
  await redis.del(redisKey);
}

// 批量重置限流（用于批量操作）
export async function resetRateLimits(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const redisKeys = keys.map((key) => buildRedisKey(key));
  await redis.del(redisKeys);
}

// 检查是否存在限流记录
export async function hasRateLimit(key: string): Promise<boolean> {
  const redisKey = buildRedisKey(key);
  const exists = await redis.exists(redisKey);
  return exists === 1;
}

// 获取限流的剩余时间（秒）
export async function getRateLimitTTL(key: string): Promise<number> {
  const redisKey = buildRedisKey(key);
  return await redis.ttl(redisKey);
}

// 限流工具类（支持链式调用）
export class RateLimiter {
  private key: string;
  private limit: number;
  private windowMs: number;
  private sliding: boolean;

  constructor(
    key: string,
    limit: number,
    windowMs: number,
    sliding: boolean = false
  ) {
    this.key = key;
    this.limit = limit;
    this.windowMs = windowMs;
    this.sliding = sliding;
  }

  // 执行限流检查
  async check(): Promise<RateLimitResult> {
    return rateLimit({
      key: this.key,
      limit: this.limit,
      windowMs: this.windowMs,
      sliding: this.sliding,
    });
  }

  // 重置限流
  async reset(): Promise<void> {
    return resetRateLimit(this.key);
  }

  // 获取状态
  async status(): Promise<RateLimitStatus | null> {
    return getRateLimitStatus(this.key);
  }
}
