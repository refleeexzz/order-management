import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import {
  orderStatusLabel,
  paymentStatusLabel,
  paymentMethodLabel,
} from "@/lib/format";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

const orderVariants: Record<OrderStatus, BadgeVariant> = {
  PENDING_PAYMENT: "warning",
  PAID: "success",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "error",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderVariants[status]}>{orderStatusLabel[status]}</Badge>;
}

const paymentVariants: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "neutral",
  CANCELLED: "neutral",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariants[status]}>{paymentStatusLabel[status]}</Badge>;
}

export function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return <Badge variant="neutral">{paymentMethodLabel[method]}</Badge>;
}
