"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiSaveTemplate } from "../lib/api";
import { useMutation } from "../lib/hooks";
import { CHANNEL_LABEL } from "../lib/format";
import type { MessageChannel, MessageTemplate } from "../lib/types";
import { TextAreaField, TextField } from "./ui";

/** Borrador local de una plantilla. El backend solo guarda lo que se pulsa Save. */
type Draft = { subject: string; text: string };

/**
 * Editor de una plantilla.
 *
 * Ojo al body: el endpoint llama `text` al cuerpo del mensaje, mientras que la
 * columna y el tipo usan `body`. Es la unica asimetria del contrato y ya esta
 * traducida en api.ts, no hay que propagarla.
 */
export function TemplateEditor({ template }: { template: MessageTemplate }) {
  const [draft, setDraft] = useState<Draft>({
    subject: template.subject ?? "",
    text: template.body,
  });

  const save = useMutation(
    (args: { key: string; channel: MessageChannel; text: string; subject?: string }) =>
      apiSaveTemplate(args),
    {
      onSuccess: () => toast.success(`Saved ${template.key} (${CHANNEL_LABEL[template.channel]}).`),
      onError: (message) => toast.error(message),
    }
  );

  const dirty = draft.text !== template.body || draft.subject !== (template.subject ?? "");

  return (
    <div
      style={{
        border: "1px solid var(--ec-hairline-strong)",
        borderRadius: 12,
        padding: 14,
        background: "var(--ec-surface-1)",
      }}
    >
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>{template.label}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {template.channel === "email" ? (
          <TextField
            label="Subject"
            value={draft.subject}
            onChange={(subject) => setDraft((prev) => ({ ...prev, subject }))}
          />
        ) : null}

        <TextAreaField
          label="Message"
          value={draft.text}
          onChange={(text) => setDraft((prev) => ({ ...prev, text }))}
          rows={4}
        />

        {template.channel === "whatsapp" && template.whatsappTemplateName ? (
          <p style={{ fontSize: 11.5, color: "var(--ec-warning)" }}>
            Sends as Meta template <strong>{template.whatsappTemplateName}</strong>. The text above is
            only a preview — Meta ignores it and uses its own approved copy.
          </p>
        ) : null}

        <div>
          <button
            type="button"
            className="ec-btn-primary"
            style={{ padding: "7px 14px", fontSize: 12.5 }}
            disabled={!dirty || save.loading}
            onClick={() =>
              void save.run({
                key: template.key,
                channel: template.channel,
                text: draft.text,
                subject: template.channel === "email" ? draft.subject : undefined,
              })
            }
          >
            {save.loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
