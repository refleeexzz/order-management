import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CreditCard,
  PackageCheck,
  Truck,
  Home,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { ordersApi, productsApi, customersApi } from "@/lib/endpoints";
import { orderStatusLabel, formatMoney } from "@/lib/format";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import type { OrderStats, OrderStatus } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const statCards: { key: keyof OrderStats; status: OrderStatus; icon: LucideIcon; tone: string }[] = [
  { key: "pendingPayment", status: "PENDING_PAYMENT", icon: Clock, tone: "text-warning" },
  { key: "paid", status: "PAID", icon: CreditCard, tone: "text-success" },
  { key: "processing", status: "PROCESSING", icon: PackageCheck, tone: "text-info" },
  { key: "shipped", status: "SHIPPED", icon: Truck, tone: "text-info" },
  { key: "delivered", status: "DELIVERED", icon: Home, tone: "text-success" },
  { key: "cancelled", status: "CANCELLED", icon: XCircle, tone: "text-error" },
];

export function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ["orders", "stats"], queryFn: ordersApi.stats });
  const products = useQuery({
    queryKey: ["products", "count"],
    queryFn: () => productsApi.list(0, 1),
  });
  const customers = useQuery({
    queryKey: ["customers", "count"],
    queryFn: () => customersApi.list(0, 1),
  });
  const recentOrders = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => ordersApi.list(0, 8),
  });

  const totalOrders = stats.data
    ? Object.values(stats.data).reduce((sum, n) => sum + n, 0)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Visão geral</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Pedidos por status e os números principais da loja.
        </p>
      </div>

      {stats.isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : stats.isError || !stats.data ? (
        <ErrorState
          message="Não foi possível carregar as estatísticas."
          onRetry={() => stats.refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map(({ key, status, icon: Icon, tone }) => (
            <Link
              key={key}
              to={`/admin/pedidos?status=${status}`}
              className="rounded-lg"
              aria-label={`Ver pedidos com status ${orderStatusLabel[status]}`}
            >
              <Card className="h-full transition-shadow duration-150 hover:shadow-md">
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {orderStatusLabel[status]}
                    </span>
                    <Icon className={`h-4 w-4 ${tone}`} aria-hidden />
                  </div>
                  <p className="text-3xl font-semibold tabular-nums text-zinc-900">
                    {stats.data[key]}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total de pedidos",
            value: totalOrders,
            loading: stats.isLoading,
            to: "/admin/pedidos",
          },
          {
            label: "Produtos ativos",
            value: products.data?.totalElements ?? null,
            loading: products.isLoading,
            to: "/admin/produtos",
          },
          {
            label: "Clientes cadastrados",
            value: customers.data?.totalElements ?? null,
            loading: customers.isLoading,
            to: "/admin/clientes",
          },
        ].map(({ label, value, loading, to }) => (
          <Card key={label}>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                {loading ? (
                  <Skeleton className="mt-2 h-7 w-16" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
                    {value ?? "—"}
                  </p>
                )}
              </div>
              <Link
                to={to}
                aria-label={`Ir para ${label}`}
                className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Pedidos recentes"
          action={
            <Link to="/admin/pedidos" className="text-sm font-medium text-brand hover:text-brand-hover">
              Ver todos
            </Link>
          }
        />
        {recentOrders.isLoading ? (
          <CardBody>
            <Skeleton className="h-40 w-full" />
          </CardBody>
        ) : recentOrders.isError || !recentOrders.data ? (
          <CardBody>
            <p className="text-sm text-zinc-600">Não foi possível carregar os pedidos.</p>
          </CardBody>
        ) : recentOrders.data.content.length === 0 ? (
          <CardBody>
            <p className="text-sm text-zinc-600">
              Nenhum pedido ainda. Os pedidos aparecem aqui assim que os clientes compram.
            </p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">Pedido</th>
                  <th scope="col" className="px-4 py-2 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.data.content.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5 font-mono text-sm">{o.orderNumber}</td>
                    <td className="px-4 py-2.5">{o.customerName}</td>
                    <td className="px-4 py-2.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {formatMoney(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
