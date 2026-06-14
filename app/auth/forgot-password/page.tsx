"use client";

import { useState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    const result = await forgotPassword(null, formData);
    setState(result);
    if (result?.success) setEmail("");
  };

  return (
    <div>
      <h1>找回密码</h1>

      {state?.success && <p>重置链接已发送到你的邮箱，请查收</p>}
      {state?.error && <p>{state.error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">发送重置链接</button>
      </form>

      <p>
        <Link href="/auth/login">返回登录</Link>
      </p>
    </div>
  );
}
