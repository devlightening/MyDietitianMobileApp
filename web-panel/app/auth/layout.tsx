import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const token = cookies().get("access_token");
  if (token) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 to-background">
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  );
}
