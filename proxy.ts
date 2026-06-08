import { auth } from "@/lib/auth"

// 不需要登录就能访问的路由（白名单）
const publicPaths = [
  "/",                    // 首页
  "/auth/login",          // 登录页
  "/auth/register",       // 注册页
  "/auth/forgot-password",// 忘记密码
  "/auth/reset-password", // 重置密码
  "/api/auth/verify-request", // 邮箱验证回调
  "/api/auth/callback",   // Auth.js 回调
]

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // 检查当前路径是否在白名单中
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))

  // 非白名单 + 未登录 → 重定向到登录页
  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return Response.redirect(loginUrl)
  }
})

// 匹配所有路由（除了静态资源和 API 内部路由）
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}