import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Tags, Pencil, Ban } from "lucide-react";
import { categoriesApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";
import { toast } from "@/stores/toast";

function CategoryFormModal({
  category,
  open,
  onClose,
}: {
  category: Category | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
      setError(null);
    }
  }, [open, category]);

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), description: description.trim() || undefined };
      return category
        ? categoriesApi.update(category.id, body)
        : categoriesApi.create(body);
    },
    onSuccess: () => {
      toast.success(category ? "Categoria atualizada" : "Categoria criada", name.trim());
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a categoria.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    save.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Editar categoria" : "Nova categoria"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="category-form" loading={save.isPending}>
            {category ? "Salvar alterações" : "Criar categoria"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <Field label="Nome" htmlFor="cf-name" required>
          <Input
            id="cf-name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cafés especiais"
          />
        </Field>
        <Field label="Descrição" htmlFor="cf-description">
          <Textarea
            id="cf-description"
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Grãos selecionados de pequenas fazendas."
          />
        </Field>
      </form>
    </Modal>
  );
}

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deactivating, setDeactivating] = useState<Category | null>(null);

  // /api/categories/all inclui inativas — somente ADMIN (§4.2).
  const categories = useQuery({
    queryKey: ["categories", "all"],
    queryFn: categoriesApi.listAll,
  });

  const deactivate = useMutation({
    mutationFn: (id: number) => categoriesApi.deactivate(id),
    onSuccess: () => {
      toast.success("Categoria desativada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeactivating(null);
    },
    onError: (err) => {
      toast.error(
        "Não foi possível desativar",
        err instanceof ApiError ? err.message : undefined,
      );
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Categorias</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Inclui categorias inativas. Desativar oculta da vitrine.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nova categoria
        </Button>
      </div>

      {categories.isLoading ? (
        <SkeletonRows rows={5} height="h-12" />
      ) : categories.isError || !categories.data ? (
        <ErrorState
          message="Não foi possível carregar as categorias."
          onRetry={() => categories.refetch()}
        />
      ) : categories.data.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria cadastrada"
          description="Crie categorias para organizar os produtos da loja."
          action={
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Criar categoria
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">Nome</th>
                  <th scope="col" className="px-4 py-2 font-medium">Descrição</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Produtos</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 font-medium">Criada em</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.data.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5 font-medium text-zinc-900">{c.name}</td>
                    <td className="max-w-64 truncate px-4 py-2.5 text-zinc-600">
                      {c.description ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.productCount}</td>
                    <td className="px-4 py-2.5">
                      {c.active ? (
                        <Badge variant="success">Ativa</Badge>
                      ) : (
                        <Badge variant="neutral">Inativa</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Editar ${c.name}`}
                          onClick={() => {
                            setEditing(c);
                            setFormOpen(true);
                          }}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        {c.active && (
                          <button
                            type="button"
                            aria-label={`Desativar ${c.name}`}
                            onClick={() => setDeactivating(c)}
                            className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-error-subtle hover:text-error"
                          >
                            <Ban className="h-4 w-4" aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CategoryFormModal
        category={editing}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
      {deactivating && (
        <Modal
          open={Boolean(deactivating)}
          onClose={() => setDeactivating(null)}
          title="Desativar categoria"
          description="A categoria some da vitrine; os produtos continuam cadastrados."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivating(null)}>
                Voltar
              </Button>
              <Button
                variant="danger"
                loading={deactivate.isPending}
                onClick={() => deactivate.mutate(deactivating.id)}
              >
                Desativar
              </Button>
            </>
          }
        >
          <p className="text-base text-zinc-700">
            Desativar <strong>{deactivating.name}</strong>? Ela deixará de aparecer na
            loja imediatamente.
          </p>
        </Modal>
      )}
    </div>
  );
}
