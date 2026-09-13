import type { Config } from "tailwindcss";

/**
 * Design tokens — "Loja Verde" marketplace.
 * Arquétipos: admin = Linear/Stripe (SaaS denso e contido),
 * storefront = Shopify (comércio limpo).
 * Uma cor de marca (emerald), neutros zinc, cores semânticas,
 * radius 4/6/8/12, espaçamento 4/8px.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#059669", // emerald-600
          hover: "#047857", // emerald-700
          active: "#065f46", // emerald-800
          subtle: "#ecfdf5", // emerald-50
          "subtle-hover": "#d1fae5", // emerald-100
        },
        success: { DEFAULT: "#16a34a", subtle: "#f0fdf4" },
        warning: { DEFAULT: "#d97706", subtle: "#fffbeb" },
        error: { DEFAULT: "#dc2626", subtle: "#fef2f2" },
        info: { DEFAULT: "#2563eb", subtle: "#eff6ff" },
        // neutros: família zinc do Tailwind (não redefinir)
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        lg: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["12px", "16px"],
        sm: ["13px", "18px"],
        base: ["14px", "20px"],
        md: ["16px", "24px"],
        lg: ["18px", "28px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
        "3xl": ["30px", "36px"],
        "4xl": ["36px", "40px"],
        "5xl": ["48px", "48px"],
      },
    },
  },
  plugins: [],
} satisfies Config;
