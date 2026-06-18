"use client";

import { register } from "@/app/actions/auth";
import { useActionState, useState } from "react";
import Link from "next/link";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const PASSWORDS_NOT_MATCH: string = "两次输入的密码不一致";

  // 实时验证密码是否一致
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // 如果确认密码已经填了，实时检查
    if (confirmPassword && newPassword !== confirmPassword) {
      setClientError(PASSWORDS_NOT_MATCH);
    } else if (confirmPassword && newPassword === confirmPassword) {
      setClientError(null);
    }
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirm = e.target.value;
    setConfirmPassword(newConfirm);
    if (password && newConfirm !== password) {
      setClientError(PASSWORDS_NOT_MATCH);
    } else {
      setClientError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError(PASSWORDS_NOT_MATCH);
      return;
    }
    if (password.length < 6) {
      e.preventDefault();
      setClientError("密码至少 6 位");
      return;
    }
    // 验证通过，清除错误，正常提交
    setClientError(null);
  };

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              验证邮件已发送
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              我们向 <strong>{state.email}</strong> 发送了一封验证邮件,
              请点击邮件中的链接完成注册, 链接 24 小时内有效。
            </p>
            <Button asChild variant="outline">
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
          <CardTitle className="text-center">注册</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={state?.email || ""}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                required
                disabled={isPending}
              />
            </div>
            {clientError && (
              <Alert variant="destructive" className="border-0">
                <AlertDescription>{clientError}</AlertDescription>
              </Alert>
            )}
            {state?.error && !clientError && (
              <Alert variant="destructive" className="border-0">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={isPending || !!clientError}
              className="w-full"
            >
              {isPending ? "注册中..." : "注册"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              已有账号？{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:underline"
              >
                立即登录
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
