// lib/errors.ts

// 定义可复用的错误消息片段
// 未来如果有其他需要复用的用户侧模糊错误消息可以加在这里
const FuzzyErrorMessages = {
  LOGIN_FAILED: "邮箱或密码错误",
} as const;

export const ErrorCode = {
  // 通用
  MISSING_FIELDS: "MISSING_FIELDS",

  // 注册相关
  INVALID_EMAIL: "INVALID_EMAIL",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",

  // 登录相关
  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  THIRD_PARTY_ONLY: "THIRD_PARTY_ONLY",

  // 验证链接相关
  LINK_INVALID: "LINK_INVALID",
  LINK_EXPIRED: "LINK_EXPIRED",

  // 重发邮件相关
  EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",

  // 用户未认证
  UNAUTHORIZED: "UNAUTHORIZED",

  // 修改密码
  PASSWORD_SAME_AS_OLD: "PASSWORD_SAME_AS_OLD",
  OLD_PASSWORD_INCORRECT: "OLD_PASSWORD_INCORRECT",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.MISSING_FIELDS]: "请填写完整信息",

  [ErrorCode.INVALID_EMAIL]: "邮箱格式不正确",
  [ErrorCode.WEAK_PASSWORD]: "密码长度至少为 6 位",
  [ErrorCode.EMAIL_ALREADY_EXISTS]: "邮箱已被注册",

  [ErrorCode.USER_NOT_FOUND]: FuzzyErrorMessages.LOGIN_FAILED,
  [ErrorCode.INVALID_PASSWORD]: FuzzyErrorMessages.LOGIN_FAILED,
  [ErrorCode.EMAIL_NOT_VERIFIED]: "邮箱未验证，请先验证邮箱",
  [ErrorCode.THIRD_PARTY_ONLY]: "该账号使用第三方登录",

  [ErrorCode.LINK_INVALID]: "验证链接无效",
  [ErrorCode.LINK_EXPIRED]: "验证链接已过期，请重新注册",

  [ErrorCode.EMAIL_ALREADY_VERIFIED]: "该邮箱已验证，请直接登录",

  [ErrorCode.UNAUTHORIZED]: "请先登录",

  [ErrorCode.PASSWORD_SAME_AS_OLD]: "新密码不能与旧密码相同",
  [ErrorCode.OLD_PASSWORD_INCORRECT]: "当前密码错误",
};
