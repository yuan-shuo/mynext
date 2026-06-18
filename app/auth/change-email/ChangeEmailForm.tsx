"use client";

import { useActionState } from "react";
import { sendChangeEmailLink } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChangeEmailForm() {
  const searchParams = useSearchParams();
  const urlSuccess = searchParams.get("success");
  const urlError = searchParams.get("errorCode");

  const [state, formAction, isPending] = useActionState(
    sendChangeEmailLink,
    null
  );

  if (urlSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">换绑邮箱</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <AlertDescription>
                邮箱更换成功！请使用新邮箱登录
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/auth/login">返回登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (urlError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">换绑邮箱</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="border-red-500 bg-red-50">
              <AlertDescription>
                链接无效或已过期，错误码：{urlError}
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/auth/change-email">重新换绑</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">换绑邮箱</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <AlertDescription>
                验证链接已发送到新邮箱，请点击邮件中的链接完成邮箱换绑。
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/auth/login">返回登录</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">换绑邮箱</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">新邮箱</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                required
                disabled={isPending}
              />
            </div>

            {state?.error && (
              <Alert variant="destructive" className="border-red-500 bg-red-50">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "发送中..." : "发送验证链接"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
