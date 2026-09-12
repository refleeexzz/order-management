import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-4 border-t border-zinc-200 px-4 py-3"
    >
      <p className="text-sm text-zinc-600">
        Página <span className="font-medium tabular-nums">{page + 1}</span> de{" "}
        <span className="font-medium tabular-nums">{totalPages}</span>
        {totalElements !== undefined && (
          <>
            {" "}· <span className="tabular-nums">{totalElements}</span>{" "}
            {totalElements === 1 ? "registro" : "registros"}
          </>
        )}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          Próxima
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
