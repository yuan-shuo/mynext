"use client";

import { useState } from "react";
import { sendChangeEmailLink } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ErrorMessage } from "@/lib/errors";

export default function ChangeEmailForm() {
  const searchParams = useSearchParams();
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const urlSuccess = searchParams.get("success");
  const urlErrorCode = searchParams.get("errorCode") as
    | keyof typeof ErrorMessage
    | null;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("newEmail", newEmail);
    const result = await sendChangeEmailLink(null, formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    setLoading(false);
  };

  const getErrorMessage = (code: keyof typeof ErrorMessage) => {
    return ErrorMessage[code] || "发生错误";
  };

  if (urlSuccess) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>邮箱更换成功！请使用新邮箱登录</p>
        <p>
          <Link href="/auth/login">返回登录</Link>
        </p>
      </div>
    );
  }

  if (urlErrorCode) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>{getErrorMessage(urlErrorCode)}</p>
        <p>
          <Link href="/auth/change-email">重新换绑</Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div>
        <h1>换绑邮箱</h1>
        <p>验证链接已发送到新邮箱，请查收</p>
        <p>点击邮件中的链接完成换绑。</p>
        <p>
          <Link href="/">返回首页</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>换绑邮箱</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>新邮箱</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "发送中..." : "发送验证链接"}
        </button>
      </form>
    </div>
  );
}
