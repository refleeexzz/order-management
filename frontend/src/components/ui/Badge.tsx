import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  brand: "bg-brand-subtle text-brand-active",
  success: "bg-success-subtle text-green-700",
  warning: "bg-warning-subtle text-amber-700",
  error: "bg-error-subtle text-red-700",
  info: "bg-info-subtle text-blue-700",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
