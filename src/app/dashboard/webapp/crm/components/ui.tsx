"use client";

// Piezas de interfaz compartidas por las pantallas del CRM.
//
// Se vive aqui y no en src/components/ui porque son especificas de esta webapp:
// el dashboard no tiene dialog, switch ni textarea, y anadir wrappers shadcn
// globales por una pantalla seria ensuciar la base de todos los dias.
//
// El Select si se reusa del dashboard: ya envuelve Radix con los
// onValueChange correctos y con el onChange de NextUI no se tropeza nadie mas.

import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X, AlertTriangle, Inbox } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Encabezado de pantalla ──────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="ec-page-header">
      <div>
        <div className="h-eyebrow" style={{ marginBottom: 8 }}>
          {eyebrow}
        </div>
        <h1 className="ec-page-title">{title}</h1>
        {subtitle ? <p className="ec-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {actions}
        </div>
      ) : null}
    </header>
  );
}

/** Bloque con eyebrow arriba y contenido debajo. Para apartar secciones. */
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div className="h-eyebrow" style={{ marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

// ─── Estados de carga, error y vacio ─────────────────────────────────────────
// El CRM original no tenia ninguno de los tres: un fetch fallido dejaba la
// pantalla vacia sin decir nada. Estos tres son la diferencia entre "se rompio"
// y "aqui no hay nada".

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "48px 24px",
        color: "var(--ec-text-muted)",
        fontSize: 14,
        justifyContent: "center",
      }}
    >
      <Loader2 size={16} className="animate-spin" style={{ color: "var(--ec-brand)" }} />
      {label}
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 18px",
        borderRadius: 12,
        background: "var(--ec-danger-soft)",
        border: "1px solid var(--ec-danger)",
        color: "var(--ec-text)",
      }}
    >
      <AlertTriangle size={17} style={{ color: "var(--ec-danger)", flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Could not load this data</div>
        <div style={{ fontSize: 13, color: "var(--ec-text-muted)", wordBreak: "break-word" }}>{message}</div>
      </div>
      {onRetry ? (
        <button type="button" className="ec-btn-secondary" style={{ padding: "6px 14px", fontSize: 13 }} onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--ec-text-muted)" }}>
      {icon ?? <Inbox size={34} style={{ margin: "0 auto 14px", opacity: 0.35 }} />}
      <p style={{ fontSize: 14, color: "var(--ec-text)" }}>{title}</p>
      {hint ? (
        <p style={{ fontSize: 13, marginTop: 6, maxWidth: "46ch", marginInline: "auto" }}>{hint}</p>
      ) : null}
    </div>
  );
}

/** Aviso en linea para el resultado de una accion (sincronizar, importar, testear). */
export function InlineResult({
  tone,
  children,
}: {
  tone: "ok" | "error" | "muted";
  children: React.ReactNode;
}) {
  const color =
    tone === "ok" ? "var(--ec-success)" : tone === "error" ? "var(--ec-danger)" : "var(--ec-text-muted)";
  return (
    <p style={{ fontSize: 12.5, color, marginTop: 8, wordBreak: "break-word" }}>{children}</p>
  );
}

// ─── Campos de formulario ────────────────────────────────────────────────────

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="ec-field-label" htmlFor={`f-${label}`}>
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={`f-${label}`}
        className="ec-field-input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  mono,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  const area = (
    <textarea
      className="ec-field-input"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={mono ? { fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12.5 } : undefined}
    />
  );

  if (!label) return area;
  return (
    <div>
      <span className="ec-field-label">{label}</span>
      {area}
    </div>
  );
}

export type SelectOption = { value: string; label: string };

/**
 * Select sobre el wrapper de Radix del dashboard. Todo el CRM pasa por aqui, de
 * forma que si Radix se rompe por una version solo hay un archivo que arreglar.
 *
 * `value` vacio significa "sin elegir", que Radix expresa con el sentinel
 * "__placeholder__" porque un SelectItem no puede tener value "".
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Choose…",
  disabled,
  width,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
}) {
  return (
    <div style={{ width }}>
      <span className="ec-field-label">{label}</span>
      <Select
        value={value || "__placeholder__"}
        onValueChange={(next) => onChange(next === "__placeholder__" ? "" : next)}
        disabled={disabled}
      >
        <SelectTrigger className="ec-field-input" style={{ width: "100%", cursor: disabled ? "not-allowed" : "pointer" }}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Interruptor sin dependencias: un boton con role="switch". */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "1px solid var(--ec-hairline-strong)",
        background: checked ? "var(--ec-brand)" : "var(--ec-surface-3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 150ms",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 150ms",
        }}
      />
    </button>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  width = 520,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 5, 8, 0.6)",
            backdropFilter: "blur(2px)",
            zIndex: 50,
          }}
        />
        <Dialog.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `min(${width}px, calc(100vw - 32px))`,
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto",
            background: "var(--ec-surface-1)",
            border: "1px solid var(--ec-hairline-strong)",
            borderRadius: 16,
            padding: 24,
            zIndex: 51,
            boxShadow: "var(--ec-shadow-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 18,
            }}
          >
            <Dialog.Title className="font-serif" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.1 }}>
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                color: "var(--ec-text-muted)",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                lineHeight: 0,
              }}
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
          {footer ? (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 22,
                paddingTop: 18,
                borderTop: "1px solid var(--ec-hairline)",
              }}
            >
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Tarjeta de dato ─────────────────────────────────────────────────────────

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const color =
    tone === "danger"
      ? "var(--ec-danger)"
      : tone === "success"
        ? "var(--ec-success)"
        : tone === "warning"
          ? "var(--ec-warning)"
          : "var(--ec-text)";

  return (
    <div className="ec-stat-tile">
      <div className="ec-stat-tile-label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div className="ec-stat-tile-num" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

/** Badge con los tonos del sistema de diseno. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
}) {
  return (
    <span
      className={cn(
        "ec-badge",
        tone === "neutral" && "ec-badge-neutral",
        tone === "success" && "ec-badge-success",
        tone === "warning" && "ec-badge-warning",
        tone === "danger" && "ec-badge-danger",
        tone === "brand" && "ec-badge-brand"
      )}
    >
      {children}
    </span>
  );
}
