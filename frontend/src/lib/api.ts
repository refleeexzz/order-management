import { useAuthStore } from "@/stores/auth";
import type { ErrorResponse, FieldError } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Erro tipado da API. `message` sempre em pt-BR amigável quando o
 * servidor devolve a mensagem genérica de 500 (§5.7: violações de
 * guarda das entidades voltam como "an unexpected error occurred").
 */
export class ApiError extends Error {
  readonly status: number;
  readonly error: string | undefined;
  readonly fieldErrors: FieldError[];

  constructor(init: {
    status: number;
    message: string;
    error?: string;
    fieldErrors?: FieldError[] | null;
  }) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status;
    this.error = init.error;
    this.fieldErrors = init.fieldErrors ?? [];
  }

  fieldMessage(field: string): string | undefined {
    return this.fieldErrors.find((f) => f.field === field)?.message;
  }
}

function friendlyMessage(status: number, serverMessage: string | undefined): string {
  if (serverMessage && serverMessage !== "an unexpected error occurred") {
    return serverMessage;
  }
  if (status === 500) {
    return "Não foi possível concluir a operação. Verifique os dados e tente novamente.";
  }
  if (status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }
  return serverMessage ?? "Ocorreu um erro inesperado. Tente novamente.";
}

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError({
      status: 0,
      message: "Não foi possível conectar ao servidor. Verifique sua conexão.",
    });
  }

  if (response.status === 401) {
    // Sessão expirada ou credenciais inválidas: limpa sessão e manda pro login,
    // exceto quando o 401 vem da própria tela de login (mensagem tratada no form).
    if (!path.startsWith("/api/auth/")) {
      useAuthStore.getState().clearSession();
      window.location.assign("/login");
    }
    throw new ApiError({ status: 401, message: "E-mail ou senha inválidos." });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const err = (data ?? {}) as Partial<ErrorResponse>;
    throw new ApiError({
      status: response.status,
      error: err.error,
      message: friendlyMessage(response.status, err.message),
      fieldErrors: err.fieldErrors,
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Record<string, QueryValue>) =>
    request<T>(path, { query }),
  post: <T>(path: string, body?: unknown, query?: Record<string, QueryValue>) =>
    request<T>(path, { method: "POST", body, query }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { BASE_URL };
