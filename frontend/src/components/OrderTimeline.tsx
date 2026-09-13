import { Check, CircleDot, XCircle, Package, CreditCard, PackageCheck, Truck, Home } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Step {
  key: string;
  label: string;
  icon: typeof Package;
  at: string | null;
  done: boolean;
  current: boolean;
}

/**
 * Linha do tempo do pedido. PROCESSING não tem timestamp no backend,
 * então a etapa aparece como concluída/atual sem data.
 */
export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-error-subtle p-4">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-error" aria-hidden />
        <div>
          <p className="text-base font-medium text-red-700">Pedido cancelado</p>
          <p className="mt-0.5 text-sm text-red-700">
            {formatDateTime(order.cancelledAt)} · o estoque foi devolvido à loja.
          </p>
        </div>
      </div>
    );
  }

  const statusOrder = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(order.status);

  const steps: Step[] = [
    {
      key: "created",
      label: "Pedido realizado",
      icon: Package,
      at: order.createdAt,
      done: true,
      current: false,
    },
    {
      key: "paid",
      label: "Pagamento aprovado",
      icon: CreditCard,
      at: order.paidAt,
      done: currentIndex >= 1,
      current: order.status === "PAID",
    },
    {
      key: "processing",
      label: "Em preparação",
      icon: PackageCheck,
      at: null,
      done: currentIndex >= 2,
      current: order.status === "PROCESSING",
    },
    {
      key: "shipped",
      label: "Enviado",
      icon: Truck,
      at: order.shippedAt,
      done: currentIndex >= 3,
      current: order.status === "SHIPPED",
    },
    {
      key: "delivered",
      label: "Entregue",
      icon: Home,
      at: order.deliveredAt,
      done: currentIndex >= 4,
      current: order.status === "DELIVERED",
    },
  ];

  return (
    <ol className="flex flex-col" aria-label="Acompanhamento do pedido">
      {steps.map((step, index) => {
        const Icon = step.done ? Check : step.current ? CircleDot : step.icon;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                  step.done
                    ? "border-brand bg-brand text-white"
                    : step.current
                      ? "border-brand bg-brand-subtle text-brand"
                      : "border-zinc-200 bg-white text-zinc-300",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {!isLast && (
                <span
                  aria-hidden
                  className={cn("w-px flex-1", step.done ? "bg-brand" : "bg-zinc-200")}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "text-base font-medium",
                  step.done || step.current ? "text-zinc-900" : "text-zinc-400",
                )}
                aria-current={step.current ? "step" : undefined}
              >
                {step.label}
              </p>
              {step.at ? (
                <p className="mt-0.5 text-sm text-zinc-500">{formatDateTime(step.at)}</p>
              ) : step.current && step.key === "processing" ? (
                <p className="mt-0.5 text-sm text-zinc-500">Seu pedido está sendo separado.</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
