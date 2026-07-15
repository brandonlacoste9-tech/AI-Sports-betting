import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LoginHeadings } from "./login-headings";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="bg-grid mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <LoginHeadings />
      <Suspense
        fallback={<div className="text-center text-sm text-muted">Loading…</div>}
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
