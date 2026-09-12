import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToastStore, type ToastKind } from "@/stores/toast";
import { cn } from "@/lib/utils";

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const iconColors: Record<ToastKind, string> = {
  success: "text-success",
  error: "text-error",
  info: "text-info",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-lg"
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconColors[t.kind])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-zinc-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-sm text-zinc-600">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dispensar notificação"
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
