// components/ui/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// ============================================
// 组件1：返回首页
// ============================================
interface BackHomeButtonProps {
  label?: string;
}

export function BackHomeButton({ label = "返回首页" }: BackHomeButtonProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <hr className="w-8/9 border-gray-200" />
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="w-full sm:w-auto"
        >
          {label}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// 组件2：返回指定页面
// ============================================
interface BackPageButtonProps {
  href: string;
  label?: string;
}

export function BackPageButton({ href, label = "返回" }: BackPageButtonProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <hr className="w-8/9 border-gray-200" />
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => router.push(href)}
          className="w-full sm:w-auto"
        >
          {label}
        </Button>
      </div>
    </div>
  );
}
