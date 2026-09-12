import type { ReactNode } from "react";
import { AlertCircle, PackageOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-zinc-200 motion-reduce:animate-none", className)}
    />
  );
}

/** Linhas de skeleton no formato da tabela/lista final (mesma altura). */
export function SkeletonRows({ rows = 5, height = "h-12" }: { rows?: number; height?: string }) {
  return (
    <div className="flex flex-col gap-2" aria-label="Carregando…" role="status">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={cn("w-full", height)} />
      ))}
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando…"
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-brand motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-zinc-400 shadow-sm">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-base font-medium text-zinc-900">{title}</p>
        {description && <p className="mt-1 text-sm text-zinc-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Algo deu errado",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-subtle text-error">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </div>
      <div>
        <p className="text-base font-medium text-zinc-900">{title}</p>
        <p className="mt-1 text-sm text-zinc-600">
          {message ?? "Não foi possível carregar os dados. Tente novamente."}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
