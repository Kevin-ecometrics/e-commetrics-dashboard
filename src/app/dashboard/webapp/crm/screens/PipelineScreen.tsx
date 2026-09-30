"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiExportCsv, apiListLeads, apiPatchLead, apiSettings } from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { downloadTextFile } from "../lib/format";
import type { Stage } from "../lib/types";
import { AddLeadModal } from "../components/AddLeadModal";
import { LeadCard } from "../components/LeadCard";
import { TasksPanel } from "../components/TasksPanel";
import { EmptyState, ErrorNotice, Loading, PageHeader } from "../components/ui";

/**
 * Tablero kanban del pipeline.
 *
 * El drag & drop es HTML5 nativo, igual que en el CRM original: son seis lineas
 * y funciona bien con pocas tarjetas por columna. Con cientos de leads un
 * backend de arrastre casero empieza a fallar, y ahi si tocaria mirar dnd-kit.
 */
export function PipelineScreen({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingOverStage, setDraggingOverStage] = useState<string | null>(null);

  const leads = useResource("leads", apiListLeads);
  // Los stages vienen piggybacked en /settings, que es de donde los sacaba el
  // original tambien. Se piden en paralelo porque son independientes.
  const settings = useResource("settings", apiSettings);

  const moveLead = useMutation(
    (id: string, stage: string) => apiPatchLead(id, { stage }),
    {
      // Un cambio de etapa dispara el CAPI de Facebook y las reglas de
      // automatizacion. Si falla, el lead se queda donde estaba: por eso el
      // "bump" de useMutation lo refresca todo y el error sale como toast.
      onError: (message) => toast.error(message),
    }
  );

  const exportCsv = useMutation(async () => {
    const csv = await apiExportCsv();
    downloadTextFile(`crm-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }, {
    onSuccess: () => toast.success("CSV downloaded."),
    onError: (message) => toast.error(message),
  });

  const allLeads = leads.data ?? [];
  const stages: Stage[] = useMemo(
    () => (settings.data?.stages ?? []).slice().sort((a, b) => a.order - b.order),
    [settings.data]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allLeads;
    return allLeads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.campaignName]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [allLeads, search]);

  const loading = (leads.loading && !leads.data) || (settings.loading && !settings.data);
  const error = leads.error ?? settings.error;

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "28px 28px 0" }}>
          <PageHeader
            eyebrow="⎯⎯⎯  PIPELINE"
            title="Lead pipeline"
            subtitle={
              search
                ? `${filtered.length} of ${allLeads.length} leads match "${search}"`
                : `${allLeads.length} ${allLeads.length === 1 ? "lead" : "leads"} in total`
            }
            actions={
              <>
                <button
                  type="button"
                  className="ec-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: 13 }}
                  onClick={() => void exportCsv.run()}
                  disabled={exportCsv.loading}
                >
                  {exportCsv.loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  Export CSV
                </button>
                <AddLeadModal />
              </>
            }
          />

          <div style={{ position: "relative", marginBottom: 18, maxWidth: 420 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ec-text-dim)",
                pointerEvents: "none",
              }}
            />
            <input
              className="ec-field-input"
              style={{ paddingLeft: 34, paddingRight: search ? 34 : 14 }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, campaign…"
              aria-label="Search leads"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--ec-text-muted)",
                  cursor: "pointer",
                  padding: 2,
                  lineHeight: 0,
                }}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowX: "auto", padding: "0 28px 28px" }}>
          {loading ? <Loading label="Loading pipeline…" /> : null}
          {error ? <ErrorNotice message={error} onRetry={() => { leads.reload(); settings.reload(); }} /> : null}

          {!loading && !error && stages.length === 0 ? (
            <EmptyState
              title="No pipeline stages."
              hint="Run crm/seed.js on the server. Without stages, leads cannot be created because of the foreign key on crm_leads.stage."
            />
          ) : null}

          {!loading && !error && stages.length > 0 && allLeads.length === 0 ? (
            <EmptyState
              title="No leads yet."
              hint="Add one manually, or run Sync now in Settings to pull leads from Facebook."
            />
          ) : null}

          {stages.length > 0 ? (
            <div style={{ display: "flex", gap: 14, height: "100%", minWidth: "min-content", alignItems: "stretch" }}>
              {stages.map((stage) => {
                const inStage = filtered.filter((lead) => lead.stage === stage.id);
                const isTarget = draggingOverStage === stage.id;
                return (
                  <div
                    key={stage.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDraggingOverStage(stage.id);
                    }}
                    onDragLeave={(event) => {
                      // dragleave tambien salta al pasar por encima de una tarjeta
                      // hija. Sin mirar relatedTarget el resaltado de destino se
                      // apaga a mitad del arrastre y la columna parece que ya no
                      // acepta la tarjeta.
                      const next = event.relatedTarget;
                      if (next instanceof Node && event.currentTarget.contains(next)) return;
                      setDraggingOverStage((current) => (current === stage.id ? null : current));
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDraggingOverStage(null);
                      const id = draggingId;
                      setDraggingId(null);
                      // Ignorar el drop en la etapa actual: sin esta guarda el
                      // PATCH dispara reglas y CAPI aunque nada haya cambiado.
                      if (id) {
                        const lead = allLeads.find((item) => item.id === id);
                        if (lead && lead.stage !== stage.id) void moveLead.run(id, stage.id);
                      }
                    }}
                    style={{
                      width: 252,
                      flexShrink: 0,
                      borderRadius: 12,
                      background: isTarget ? "var(--ec-brand-softer)" : "var(--ec-surface-2)",
                      border: `1px solid ${isTarget ? "var(--ec-brand)" : "transparent"}`,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      transition: "background 150ms, border-color 150ms",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{stage.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--ec-text-dim)" }}>
                        {inStage.length}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
                      {inStage.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} onDragStart={setDraggingId} onOpen={onOpenLead} />
                      ))}
                      {inStage.length === 0 ? (
                        <p style={{ fontSize: 11.5, color: "var(--ec-text-faint)", padding: "10px 2px" }}>
                          {isTarget ? "Drop here" : "Empty"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <TasksPanel onOpenLead={onOpenLead} />
    </div>
  );
}
