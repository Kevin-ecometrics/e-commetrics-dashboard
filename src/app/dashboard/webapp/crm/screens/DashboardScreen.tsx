"use client";

import { apiDashboard } from "../lib/api";
import { useResource } from "../lib/hooks";
import { ErrorNotice, Loading, PageHeader, StatTile } from "../components/ui";

/**
 * Metricas del CRM. Mismos nueve numeros que el endpoint devuelve, sin mas.
 *
 * El "grafico de leads por etapa" son divs con el color de cada etapa, igual
 * que en el original. No hay libreria de charts en este dashboard y para seis
 * barras horizontales no hace falta una.
 */
export function DashboardScreen() {
  const dashboard = useResource("dashboard", apiDashboard);
  const data = dashboard.data;

  if (dashboard.loading && !data) return <Loading label="Loading metrics…" />;
  if (dashboard.error && !data) {
    return (
      <div style={{ padding: 28 }}>
        <ErrorNotice message={dashboard.error} onRetry={dashboard.reload} />
      </div>
    );
  }
  if (!data) return <Loading />;

  const maxStageCount = Math.max(1, ...data.leadsByStage.map((stage) => stage.count));

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 28 }}>
      <PageHeader
        eyebrow="⎯⎯⎯  OVERVIEW"
        title="Dashboard"
        subtitle="Where the pipeline stands right now. Refreshes when anything changes in the app."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 34,
        }}
      >
        <StatTile label="Total leads" value={data.totalLeads} />
        <StatTile
          label={data.conversionStageName ? `Conversion (${data.conversionStageName})` : "Conversion"}
          value={`${data.conversionRate}%`}
          tone={data.conversionRate > 0 ? "success" : "default"}
        />
        <StatTile label="Open tasks" value={data.tasksOpen} />
        <StatTile
          label="Overdue tasks"
          value={data.tasksOverdue}
          tone={data.tasksOverdue > 0 ? "danger" : "default"}
        />
        <StatTile label="Messages sent" value={data.messagesSent} />
        <StatTile
          label="Messages failed"
          value={data.messagesFailed}
          tone={data.messagesFailed > 0 ? "danger" : "default"}
        />
        <StatTile label="Facebook leads" value={data.leadsBySource.facebook} />
        <StatTile
          label="Manual + CSV leads"
          value={data.leadsBySource.manual + data.leadsBySource.csv}
        />
      </div>

      <section>
        <div className="h-eyebrow" style={{ marginBottom: 16 }}>
          Leads by stage
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.leadsByStage.map((stage) => (
            <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 130, flexShrink: 0, fontSize: 13, color: "var(--ec-text-muted)" }}>
                {stage.name}
              </span>
              <div style={{ flex: 1 }}>
                <div className="ec-progress">
                  <div
                    className="ec-progress-bar"
                    style={{ width: `${(stage.count / maxStageCount) * 100}%`, background: stage.color }}
                  />
                </div>
              </div>
              <span
                style={{ width: 34, textAlign: "right", fontSize: 13, color: "var(--ec-text-muted)", flexShrink: 0 }}
              >
                {stage.count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
