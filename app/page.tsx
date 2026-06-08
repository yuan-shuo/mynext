import { auth } from "@/lib/auth"
import Link from "next/link"
import { logout } from "@/app/actions/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div>
      <h1>我的应用</h1>
      
      {session ? (
        <div>
          <span>欢迎，{session.user?.email}！</span>
          <form action={logout}>
            <button type="submit">退出登录</button>
          </form>
          <Link href="/auth/change-password">修改密码</Link>
          <Link href="/auth/change-email">换绑邮箱</Link>
        </div>
      ) : (
        <p>
          <Link href="/auth/login">登录</Link> | <Link href="/auth/register">注册</Link>
        </p>
      )}
    </div>
  )
}