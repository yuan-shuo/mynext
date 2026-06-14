import { Suspense } from "react";
import ChangeEmailForm from "./ChangeEmailForm";

export default function ChangeEmailPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ChangeEmailForm />
    </Suspense>
  );
}
