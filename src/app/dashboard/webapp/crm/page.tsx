"use client";

import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { BarChart3, KanbanSquare, LogOut, Settings } from "lucide-react";
import { CrmDataProvider } from "./lib/hooks";
import { CrmSessionProvider, useCrmSession } from "./lib/session";
import { useCrmNav, type CrmView } from "./lib/nav";
import { LoginForm } from "./components/LoginForm";
import { Loading } from "./components/ui";
import { DashboardScreen } from "./screens/DashboardScreen";
import { LeadDetailScreen } from "./screens/LeadDetailScreen";
import { PipelineScreen } from "./screens/PipelineScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

// useSearchParams necesita un <Suspense> por encima o el build estatico falla:
// en un export estatico no hay request durante el prerender.
export default function CrmPage() {
  return (
    <CrmSessionProvider>
      <CrmDataProvider>
        <Suspense fallback={<Loading label="Loading CRM…" />}>
          <CrmApp />
        </Suspense>
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      </CrmDataProvider>
    </CrmSessionProvider>
  );
}

function CrmApp() {
  const { status, user, logout } = useCrmSession();
  const nav = useCrmNav();

  if (status === "restoring") return <Loading label="Restoring session…" />;
  if (status === "anonymous") return <LoginForm />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ec-bg)", display: "flex", flexDirection: "column" }}>
      <CrmTopbar
        view={nav.view}
        onNavigate={(next) => (next === "pipeline" ? nav.goPipeline() : next === "dashboard" ? nav.goDashboard() : nav.goSettings())}
        userName={user?.name ?? ""}
        onLogout={logout}
      />
      <main style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {nav.view === "pipeline" ? <PipelineScreen onOpenLead={nav.goLead} /> : null}
        {nav.view === "dashboard" ? <DashboardScreen /> : null}
        {nav.view === "settings" ? <SettingsScreen /> : null}
        {nav.view === "lead" ? (
          nav.leadId ? (
            <LeadDetailScreen leadId={nav.leadId} onBack={nav.goPipeline} />
          ) : (
            <div style={{ padding: 28 }}>
              <p style={{ fontSize: 13.5, color: "var(--ec-text-muted)" }}>
                No lead selected.{" "}
                <button
                  type="button"
                  onClick={nav.goPipeline}
                  style={{
                    color: "var(--ec-brand)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "inherit",
                    padding: 0,
                  }}
                >
                  Back to pipeline
                </button>
              </p>
            </div>
          )
        ) : null}
      </main>
    </div>
  );
}

const NAV_ITEMS: { view: CrmView; label: string; icon: typeof KanbanSquare }[] = [
  { view: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { view: "dashboard", label: "Dashboard", icon: BarChart3 },
  { view: "settings", label: "Settings", icon: Settings },
];

function CrmTopbar({
  view,
  onNavigate,
  userName,
  onLogout,
}: {
  view: CrmView;
  onNavigate: (next: CrmView) => void;
  userName: string;
  onLogout: () => void;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "14px 28px",
        borderBottom: "1px solid var(--ec-hairline)",
        background: "var(--ec-surface-1)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="font-serif" style={{ fontSize: 20, fontWeight: 400 }}>
          CRM
        </span>
        <span style={{ fontSize: 12, color: "var(--ec-text-dim)" }}>Reforma Dental</span>
      </div>

      <nav className="ec-segmented">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // En la ficha de un lead se mantiene "Pipeline" encendido, porque es la
          // pantalla de la que se salio. Marcar las cuatro a la vez seria raro.
          const active = view === item.view || (view === "lead" && item.view === "pipeline");
          return (
            <button
              key={item.view}
              type="button"
              className={active ? "active" : ""}
              onClick={() => onNavigate(item.view)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Icon size={13} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {userName ? (
          <span style={{ fontSize: 12.5, color: "var(--ec-text-muted)" }}>{userName}</span>
        ) : null}
        <button
          type="button"
          className="ec-btn-secondary"
          style={{ padding: "7px 13px", fontSize: 12.5 }}
          onClick={onLogout}
          aria-label="Sign out"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  );
}
