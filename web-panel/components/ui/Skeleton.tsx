import React from "react";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "animate-pulse rounded bg-muted/60 " + className
      }
      {...props}
    />
  );
}
