// /app/auth/layout.tsx
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 to-background">
      <div className="w-full max-w-md mx-auto">{children}</div>
    </div>
  );
}