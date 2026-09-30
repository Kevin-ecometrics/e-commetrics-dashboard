"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiCompleteTask, apiListTasks } from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { DAY_MS, formatDateTime, isDueWithin, isOverdue } from "../lib/format";
import { EmptyState, ErrorNotice, Loading } from "./ui";

/**
 * Panel lateral de tareas. La version original solo enseñaba las que vencen hoy
 * o manana y ocultaba el resto sin decir nada; aqui se mantiene ese filtro
 * (es lo que se usa a diario) pero se dice explicitamente cuantas hay fuera.
 */
export function TasksPanel({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const tasks = useResource("tasks", apiListTasks);

  const complete = useMutation((id: string) => apiCompleteTask(id), {
    onError: (message) => toast.error(message),
  });

  const all = tasks.data ?? [];
  const now = Date.now();
  const open = all.filter((task) => !task.done);
  const dueSoon = open.filter((task) => isDueWithin(task.dueAt, DAY_MS, now));
  const overdueCount = dueSoon.filter((task) => isOverdue(task.dueAt, now)).length;
  const hiddenCount = open.length - dueSoon.length;

  return (
    <aside
      style={{
        width: 300,
        flexShrink: 0,
        borderLeft: "1px solid var(--ec-hairline)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600 }}>
          Tasks due today
          <span style={{ color: "var(--ec-text-muted)", fontWeight: 400 }}> ({dueSoon.length})</span>
          {overdueCount > 0 ? (
            <span style={{ color: "var(--ec-danger)", fontWeight: 400 }}> · {overdueCount} overdue</span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={tasks.reload}
          aria-label="Refresh tasks"
          style={{ background: "none", border: "none", color: "var(--ec-text-muted)", cursor: "pointer", padding: 4 }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {tasks.loading && !tasks.data ? <Loading label="Loading tasks…" /> : null}
      {tasks.error ? <ErrorNotice message={tasks.error} onRetry={tasks.reload} /> : null}

      {!tasks.loading && !tasks.error && dueSoon.length === 0 ? (
        <EmptyState title="Nothing due — nice." hint="Tasks are created by the automation rules in Settings." />
      ) : null}

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {dueSoon.map((task) => {
          const overdue = isOverdue(task.dueAt, now);
          return (
            <li key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
              <input
                type="checkbox"
                checked={false}
                disabled={complete.loading}
                onChange={() => void complete.run(task.id)}
                aria-label={`Mark "${task.description}" as done`}
                style={{ marginTop: 3, cursor: "pointer", accentColor: "var(--ec-brand)" }}
              />
              <button
                type="button"
                onClick={() => onOpenLead(task.leadId)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: overdue ? "var(--ec-danger)" : "var(--ec-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.description}
                </span>
                <span style={{ display: "block", fontSize: 11, color: overdue ? "var(--ec-danger)" : "var(--ec-text-dim)" }}>
                  {overdue ? "Overdue — " : ""}
                  {formatDateTime(task.dueAt)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 ? (
        <p style={{ fontSize: 11.5, color: "var(--ec-text-dim)" }}>
          {hiddenCount} other open {hiddenCount === 1 ? "task" : "tasks"} further out.
        </p>
      ) : null}

      {complete.loading ? (
        <p style={{ fontSize: 11.5, color: "var(--ec-text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
          <Loader2 size={12} className="animate-spin" /> Saving…
        </p>
      ) : null}
    </aside>
  );
}
