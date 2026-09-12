import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toaster } from "@/components/Toaster";
import { toast } from "@/stores/toast";

/** Smoke test do design system — substituído pelo router no marco 2. */
export default function App() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Loja Verde — design system
      </h1>
      <p className="mt-2 text-md text-zinc-600">
        Base do novo frontend: Vite + React 18 + TypeScript + Tailwind.
      </p>
      <Card className="mt-8">
        <CardHeader title="Componentes" description="Tokens aplicados: brand emerald, neutros zinc, radius 4/6/8/12." />
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => toast.success("Tudo certo", "Design system funcionando.")}>
              Primário
            </Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Perigo</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="brand">Marca</Badge>
            <Badge variant="success">Sucesso</Badge>
            <Badge variant="warning">Aviso</Badge>
            <Badge variant="error">Erro</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <Input placeholder="Campo de texto" aria-label="Exemplo" />
        </CardBody>
      </Card>
      <Toaster />
    </main>
  );
}
