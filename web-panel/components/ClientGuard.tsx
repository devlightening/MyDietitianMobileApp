"use client";
import { ReactNode } from "react";

export default function ClientGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
