"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginErrorMessage, useCrmSession } from "../lib/session";
import { TextField } from "./ui";

/**
 * Puerta de entrada del CRM.
 *
 * El CRM de Next.js no tenia login: sus 15 rutas eran publicas y cualquiera que
 * supiera la URL podia leer PII de leads o disparar envio de SMS. Este formulario
 * es lo que cierra eso.
 */
export function LoginForm() {
  const { login } = useCrmSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--ec-bg)",
      }}
    >
      <div style={{ width: "min(400px, 100%)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="h-eyebrow" style={{ marginBottom: 10 }}>
            Reforma Dental
          </div>
          <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em" }}>
            CRM
          </h1>
        </div>

        <form
          onSubmit={submit}
          className="ec-project-card"
          style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
        >
          <TextField
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="you@reformadental.com"
            autoFocus
          />
          <TextField
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••••"
          />

          {error ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--ec-danger)",
                background: "var(--ec-danger-soft)",
                border: "1px solid var(--ec-danger)",
                borderRadius: 8,
                padding: "9px 12px",
              }}
            >
              {error}
            </p>
          ) : null}

          <button type="submit" className="ec-btn-primary" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: "var(--ec-text-dim)", textAlign: "center", marginTop: 18 }}>
          Sessions last 7 days. Ask the CRM admin for an account.
        </p>
      </div>
    </div>
  );
}
