import type { Metadata } from "next";
import { RegisterForm } from "./register-form";
import { RegisterHeadings } from "./register-headings";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <div className="bg-grid mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <RegisterHeadings />
      <RegisterForm />
    </div>
  );
}
