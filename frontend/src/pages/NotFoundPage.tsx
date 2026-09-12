import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <EmptyState
        icon={Compass}
        title="Página não encontrada"
        description="O endereço que você acessou não existe ou foi movido."
        action={
          <Link to="/">
            <Button>Voltar para a loja</Button>
          </Link>
        }
      />
    </main>
  );
}
