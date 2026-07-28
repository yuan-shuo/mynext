/**
 * 生成随机邮箱
 * @returns 随机生成的邮箱字符串
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * 生成随机密码
 * @returns 随机生成的密码
 */
export function generateRandomPassword(): string {
  return `Test@${Math.random().toString(36).substring(2, 10)}123`;
}
