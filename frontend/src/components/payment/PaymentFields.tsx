import { QrCode, Barcode, CreditCard, Landmark } from "lucide-react";
import type { PaymentMethod } from "@/lib/types";
import { paymentMethodLabel } from "@/lib/format";
import { Field, Input, Select } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface CardData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface PaymentSelection {
  method: PaymentMethod;
  installments: number;
  card: CardData;
}

const methodIcons: Record<PaymentMethod, typeof QrCode> = {
  PIX: QrCode,
  BANK_SLIP: Barcode,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  BANK_TRANSFER: Landmark,
};

const methodHint: Record<PaymentMethod, string> = {
  PIX: "Aprovação imediata com QR Code",
  BANK_SLIP: "Aprovação imediata nesta loja",
  CREDIT_CARD: "Em até 12x",
  DEBIT_CARD: "Débito à vista",
  BANK_TRANSFER: "Transferência (TED)",
};

export function isCardMethod(method: PaymentMethod): boolean {
  return method === "CREDIT_CARD" || method === "DEBIT_CARD";
}

/**
 * Monta o cardToken que o servidor exige para métodos de cartão/TED
 * (simulação de gateway — SPEC §5.6). PIX e boleto dispensam token.
 */
export function buildCardToken(selection: PaymentSelection): string | undefined {
  if (isCardMethod(selection.method)) {
    const digits = selection.card.number.replace(/\D/g, "");
    return `tok_${selection.method.toLowerCase()}_${digits.slice(-4)}_${Date.now()}`;
  }
  if (selection.method === "BANK_TRANSFER") {
    return `tok_ted_${Date.now()}`;
  }
  return undefined;
}

export function validateCard(card: CardData): string | null {
  if (card.number.replace(/\D/g, "").length < 13) return "Informe um número de cartão válido.";
  if (!card.holder.trim()) return "Informe o nome impresso no cartão.";
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Informe a validade no formato MM/AA.";
  if (card.cvv.replace(/\D/g, "").length < 3) return "Informe o código de segurança.";
  return null;
}

export function PaymentFields({
  value,
  onChange,
}: {
  value: PaymentSelection;
  onChange: (next: PaymentSelection) => void;
}) {
  const methods: PaymentMethod[] = ["PIX", "CREDIT_CARD", "DEBIT_CARD", "BANK_SLIP", "BANK_TRANSFER"];

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Forma de pagamento" className="grid gap-2 sm:grid-cols-2">
        {methods.map((method) => {
          const Icon = methodIcons[method];
          const selected = value.method === method;
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ ...value, method })}
              className={cn(
                "flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
                selected
                  ? "border-brand bg-brand-subtle"
                  : "border-zinc-300 bg-white hover:border-zinc-400",
              )}
            >
              <Icon
                className={cn("h-5 w-5 shrink-0", selected ? "text-brand" : "text-zinc-400")}
                aria-hidden
              />
              <span>
                <span className="block text-sm font-medium text-zinc-900">
                  {paymentMethodLabel[method]}
                </span>
                <span className="block text-xs text-zinc-500">{methodHint[method]}</span>
              </span>
            </button>
          );
        })}
      </div>

      {value.method === "PIX" && (
        <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Após confirmar o pedido, seu pagamento PIX é aprovado na hora e o pedido
          entra em preparação.
        </p>
      )}

      {isCardMethod(value.method) && (
        <fieldset className="flex flex-col gap-4">
          <legend className="sr-only">Dados do cartão (ambiente de demonstração)</legend>
          <Field label="Número do cartão" htmlFor="card-number" required>
            <Input
              id="card-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4111 1111 1111 1111"
              maxLength={19}
              value={value.card.number}
              onChange={(e) => onChange({ ...value, card: { ...value.card, number: e.target.value } })}
            />
          </Field>
          <Field label="Nome impresso no cartão" htmlFor="card-holder" required>
            <Input
              id="card-holder"
              autoComplete="cc-name"
              placeholder="MARIA DA SILVA"
              value={value.card.holder}
              onChange={(e) => onChange({ ...value, card: { ...value.card, holder: e.target.value } })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Validade" htmlFor="card-expiry" required hint="MM/AA">
              <Input
                id="card-expiry"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="12/28"
                maxLength={5}
                value={value.card.expiry}
                onChange={(e) => onChange({ ...value, card: { ...value.card, expiry: e.target.value } })}
              />
            </Field>
            <Field label="CVV" htmlFor="card-cvv" required>
              <Input
                id="card-cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                maxLength={4}
                value={value.card.cvv}
                onChange={(e) => onChange({ ...value, card: { ...value.card, cvv: e.target.value } })}
              />
            </Field>
          </div>
          {value.method === "CREDIT_CARD" && (
            <Field label="Parcelas" htmlFor="card-installments">
              <Select
                id="card-installments"
                value={value.installments}
                onChange={(e) => onChange({ ...value, installments: Number(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <p className="text-xs text-zinc-500">
            Ambiente de demonstração: os dados do cartão não saem do seu navegador;
            enviamos apenas um identificador de pagamento simulado ao servidor.
          </p>
        </fieldset>
      )}

    </div>
  );
}
