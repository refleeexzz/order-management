import { Field, Input } from "@/components/ui/Input";
import type { Address } from "@/lib/types";

export const emptyAddress: Address = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

/** Remove chaves vazias para não mandar strings em branco ao servidor. */
export function compactAddress(address: Address): Address | undefined {
  const cleaned = Object.fromEntries(
    Object.entries(address)
      .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      .filter(([, v]) => v !== "" && v !== undefined && v !== null),
  ) as Address;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

export function AddressFields({
  value,
  onChange,
  idPrefix,
}: {
  value: Address;
  onChange: (next: Address) => void;
  idPrefix: string;
}) {
  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <div className="grid gap-4 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <Field label="Rua" htmlFor={`${idPrefix}-street`}>
          <Input
            id={`${idPrefix}-street`}
            maxLength={200}
            value={value.street ?? ""}
            onChange={set("street")}
            placeholder="Av. Paulista"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Número" htmlFor={`${idPrefix}-number`}>
          <Input
            id={`${idPrefix}-number`}
            maxLength={10}
            value={value.number ?? ""}
            onChange={set("number")}
            placeholder="1000"
          />
        </Field>
      </div>
      <div className="sm:col-span-3">
        <Field label="Complemento" htmlFor={`${idPrefix}-complement`}>
          <Input
            id={`${idPrefix}-complement`}
            maxLength={100}
            value={value.complement ?? ""}
            onChange={set("complement")}
            placeholder="Apto 42 (opcional)"
          />
        </Field>
      </div>
      <div className="sm:col-span-3">
        <Field label="Bairro" htmlFor={`${idPrefix}-neighborhood`}>
          <Input
            id={`${idPrefix}-neighborhood`}
            maxLength={100}
            value={value.neighborhood ?? ""}
            onChange={set("neighborhood")}
            placeholder="Bela Vista"
          />
        </Field>
      </div>
      <div className="sm:col-span-3">
        <Field label="Cidade" htmlFor={`${idPrefix}-city`}>
          <Input
            id={`${idPrefix}-city`}
            maxLength={100}
            value={value.city ?? ""}
            onChange={set("city")}
            placeholder="São Paulo"
          />
        </Field>
      </div>
      <div className="sm:col-span-1">
        <Field label="UF" htmlFor={`${idPrefix}-state`}>
          <Input
            id={`${idPrefix}-state`}
            maxLength={2}
            value={value.state ?? ""}
            onChange={(e) =>
              onChange({ ...value, state: e.target.value.toUpperCase() })
            }
            placeholder="SP"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="CEP" htmlFor={`${idPrefix}-zip`} hint="00000-000">
          <Input
            id={`${idPrefix}-zip`}
            maxLength={9}
            inputMode="numeric"
            value={value.zipCode ?? ""}
            onChange={set("zipCode")}
            placeholder="01310-100"
          />
        </Field>
      </div>
    </div>
  );
}
