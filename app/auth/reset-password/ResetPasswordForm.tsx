"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import Link from "next/link";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);

  const isValid = token && email ? true : false;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setState({ error: "两次输入的密码不一致" });
      return;
    }

    if (password.length < 6) {
      setState({ error: "密码长度至少为 6 位" });
      return;
    }

    const formData = new FormData();
    formData.append("email", email!);
    formData.append("token", token!);
    formData.append("password", password);

    const result = await resetPassword(null, formData);
    setState(result);

    if (result?.success) {
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">重置密码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-red-50 text-center">
              <AlertDescription className="font-medium">
                重置链接无效或已过期
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">重新请求重置密码</Link>
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
          <CardTitle className="text-center">重置密码</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {state?.success && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <AlertDescription>
                密码重置成功！正在跳转到登录页...
              </AlertDescription>
            </Alert>
          )}

          {!state?.success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">新密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {state?.error && (
                <Alert
                  variant="destructive"
                  className="border-red-500 bg-red-50"
                >
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                重置密码
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
