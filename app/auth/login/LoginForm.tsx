"use client";

import { login, resendVerificationEmail } from "@/app/actions/auth";
import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackHomeButton } from "@/components/ui/back-button";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(login, null);
  const [resendState, resendAction, isResending] = useActionState(
    resendVerificationEmail,
    null
  );

  useEffect(() => {
    if (state?.success) {
      router.push("/");
    }
  }, [state, router]);

  const verified = searchParams.get("verified");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">登录</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {verified && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <AlertDescription>邮箱验证成功！请登录</AlertDescription>
            </Alert>
          )}

          {state?.error && !state?.needsEmailVerification && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                defaultValue={state?.email || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "登录中..." : "登录"}
            </Button>
          </form>

          {state?.needsEmailVerification && state?.email && (
            <div className="space-y-3">
              <h3 className="font-medium text-center">重新发送验证邮件</h3>
              <form action={resendAction} className="space-y-3">
                <input type="hidden" name="email" value={state.email} />
                <p className="text-sm text-gray-600 text-center">
                  我们将向 {state.email} 重新发送验证邮件。
                </p>
                {resendState?.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{resendState.error}</AlertDescription>
                  </Alert>
                )}
                {resendState?.success && (
                  <Alert className="border-green-500 bg-green-50 text-green-700">
                    <AlertDescription>
                      验证邮件已重新发送！请查收
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2 text-center text-sm text-gray-600">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isResending}
                  >
                    {isResending ? "发送中..." : "确认发送"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-2 text-center">
            <p>
              还没有账号？{" "}
              <Link
                href="/auth/register"
                className="hover:underline text-blue-600"
              >
                立即注册
              </Link>
            </p>
            <p>
              <Link
                href="/auth/forgot-password"
                className="hover:underline text-blue-600"
              >
                忘记密码？
              </Link>
            </p>
          </div>
          <BackHomeButton></BackHomeButton>
        </CardContent>
      </Card>
    </div>
  );
}
