import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0"),
  lazyConnect: false, // 自动连接
  retryStrategy: (times) => {
    // 重试最多 10 次
    if (times > 10) return null;
    return Math.min(times * 100, 3000);
  },
});

redis.on("connect", () => {
  console.log("Redis 连接成功");
});

redis.on("error", (error) => {
  console.error("Redis 连接错误:", error);
});

export default redis;
