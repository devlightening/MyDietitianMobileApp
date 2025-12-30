import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function ServerGuard({ children, redirectTo = "/auth/login" }: { children: ReactNode; redirectTo?: string }) {
  const token = cookies().get("access_token");

  if (!token) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
