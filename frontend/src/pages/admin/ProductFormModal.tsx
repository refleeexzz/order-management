import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import { isImageUploadConfigured, uploadImage } from "@/lib/imgbb";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ProductImage } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/stores/toast";

interface FormState {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  sku: string;
  imageUrl: string;
  categoryId: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  sku: "",
  imageUrl: "",
  categoryId: "",
};

export function ProductFormModal({
  product,
  open,
  onClose,
}: {
  /** null = criação; Product = edição (update parcial, SKU não editável). */
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.listActive,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name,
              description: product.description ?? "",
              price: String(product.price),
              stockQuantity: String(product.stockQuantity),
              sku: product.sku ?? "",
              imageUrl: product.imageUrl ?? "",
              categoryId: String(product.categoryId),
            }
          : emptyForm,
      );
      setError(null);
      setFieldErrors({});
    }
  }, [open, product]);

  const save = useMutation({
    mutationFn: () => {
      const base = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl.trim() || undefined,
        categoryId: Number(form.categoryId),
      };
      if (product) {
        // UpdateProductRequest: sem SKU (o backend não permite alterá-lo).
        return productsApi.update(product.id, base);
      }
      return productsApi.create({
        ...base,
        sku: form.sku.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(product ? "Produto atualizado" : "Produto criado", form.name.trim());
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message);
        const map: Record<string, string> = {};
        for (const fe of err.fieldErrors) map[fe.field] = fe.message;
        setFieldErrors(map);
      } else {
        setError("Não foi possível salvar o produto.");
      }
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    if (!form.categoryId) {
      setError("Selecione uma categoria.");
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stockQuantity);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Estoque deve ser um número inteiro maior ou igual a zero.");
      return;
    }
    save.mutate();
  }

  async function onFileSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast.success("Imagem enviada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload da imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Editar produto" : "Novo produto"}
      description={
        product
          ? `${product.name} · SKU ${product.sku ?? "—"}`
          : "Cadastre um produto ativo na loja."
      }
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={save.isPending || uploading}>
            {product ? "Salvar alterações" : "Criar produto"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Field label="Nome" htmlFor="pf-name" required error={fieldErrors.name}>
          <Input
            id="pf-name"
            required
            maxLength={150}
            invalid={Boolean(fieldErrors.name)}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Café torrado artesanal 500g"
          />
        </Field>

        <Field label="Descrição" htmlFor="pf-description" error={fieldErrors.description}>
          <Textarea
            id="pf-description"
            maxLength={1000}
            invalid={Boolean(fieldErrors.description)}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Notas de chocolate e caramelo, torra média."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Preço (R$)" htmlFor="pf-price" required error={fieldErrors.price}>
            <Input
              id="pf-price"
              required
              inputMode="decimal"
              invalid={Boolean(fieldErrors.price)}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value.replace(",", ".") })}
              placeholder="49,90"
            />
          </Field>
          <Field
            label="Estoque"
            htmlFor="pf-stock"
            required
            error={fieldErrors.stockQuantity}
          >
            <Input
              id="pf-stock"
              required
              inputMode="numeric"
              invalid={Boolean(fieldErrors.stockQuantity)}
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              placeholder="25"
            />
          </Field>
          <Field
            label="SKU"
            htmlFor="pf-sku"
            error={fieldErrors.sku}
            hint={product ? "O SKU não pode ser alterado." : "Opcional, único."}
          >
            <Input
              id="pf-sku"
              maxLength={50}
              disabled={Boolean(product)}
              invalid={Boolean(fieldErrors.sku)}
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="CAF-500-001"
            />
          </Field>
        </div>

        <Field label="Categoria" htmlFor="pf-category" required error={fieldErrors.categoryId}>
          <Select
            id="pf-category"
            required
            invalid={Boolean(fieldErrors.categoryId)}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Selecione…</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex flex-col gap-2">
          <Field
            label="Imagem do produto"
            htmlFor="pf-image"
            error={fieldErrors.imageUrl}
            hint={
              isImageUploadConfigured
                ? "Envie um arquivo ou cole a URL da imagem."
                : "Upload não configurado (VITE_IMGBB_API_KEY) — cole a URL da imagem."
            }
          >
            <Input
              id="pf-image"
              type="url"
              maxLength={500}
              invalid={Boolean(fieldErrors.imageUrl)}
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <div className="flex items-center gap-3">
            {isImageUploadConfigured && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileSelected(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Enviar imagem
                </Button>
              </>
            )}
            {form.imageUrl && (
              <ProductImage
                src={form.imageUrl}
                alt="Pré-visualização do produto"
                className="h-16 w-16 rounded-md border border-zinc-200"
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
