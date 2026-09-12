import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const baseFieldClasses =
  "w-full rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150 hover:border-zinc-400 focus:border-brand disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500 aria-invalid:border-error";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseFieldClasses, "h-9", className)}
      {...props}
    />
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(baseFieldClasses, "min-h-20 py-2", className)}
        {...props}
      />
    );
  },
);

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(baseFieldClasses, "h-9 pr-8", className)}
      {...props}
    >
      {children}
    </select>
  );
});

export interface FieldProps {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Rótulo visível + erro inline acessível (aria-describedby apontando para a mensagem). */
export function Field({ label, htmlFor, required, error, hint, children }: FieldProps) {
  const errorId = `${htmlFor}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-error" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-xs text-error">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
