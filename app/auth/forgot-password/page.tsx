"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>找回密码</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              发送重置链接
            </Button>
            {state?.success && (
              <Alert className="border-green-500 bg-green-50 text-green-700">
                <AlertDescription>
                  重置链接已发送到你的邮箱，请查收
                </AlertDescription>
              </Alert>
            )}

            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </form>
          <hr className="my-5" />
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/auth/login">返回登录</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
