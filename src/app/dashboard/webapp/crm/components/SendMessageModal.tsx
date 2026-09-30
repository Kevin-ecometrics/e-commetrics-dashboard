"use client";

import { useMemo, useState } from "react";
import { Loader2, Mail, MessageCircle, Send } from "lucide-react";
import { apiSendMessage, statusOf } from "../lib/api";
import { useMutation } from "../lib/hooks";
import { CHANNEL_LABEL } from "../lib/format";
import type { Lead, MessageChannel, MessageTemplate } from "../lib/types";
import { Badge, InlineResult, Modal, SelectField } from "./ui";

// SMS existe en el backend pero el original solo ofrecia email y WhatsApp desde
// el lead. Se mantiene igual: mandar un SMS a un lead que no lo ha pedido es la
// clase de cosas que quema la cuenta de Twilio.
const CHANNELS: MessageChannel[] = ["email", "whatsapp"];

const CHANNEL_ICON = {
  email: <Mail size={13} />,
  sms: <MessageCircle size={13} />,
  whatsapp: <MessageCircle size={13} />,
} as const;

/**
 * Envio de plantilla a un lead.
 *
 * Un 502 aqui no significa que la app este rota: el backend responde 502 cuando
 * el proveedor (Meta, SMTP) fallo, y 4xx cuando la peticion estaba mal. Se
 * distinguen en el mensaje porque la accion a seguir es distinta: reintentar en
 * un caso, corregir en el otro.
 */
export function SendMessageModal({
  lead,
  templates,
  onSent,
}: {
  lead: Lead;
  templates: MessageTemplate[];
  onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>("email");
  const [templateKey, setTemplateKey] = useState("");
  // Un 502 no significa que la app este rota: el backend responde 502 cuando el
  // proveedor (Meta, SMTP) fallo y 4xx cuando la peticion estaba mal. Se guarda
  // aparte porque la accion a seguir es distinta y no se puede deducir del texto.
  const [providerDown, setProviderDown] = useState(false);

  const send = useMutation(
    (args: { channel: MessageChannel; templateKey: string }) =>
      apiSendMessage(lead.id, args.channel, args.templateKey),
    {
      onSuccess: () => onSent(),
      onError: (_message, error) => setProviderDown(statusOf(error) === 502),
    }
  );

  const forChannel = useMemo(
    () => templates.filter((template) => template.channel === channel),
    [templates, channel]
  );

  const selected = forChannel.find((template) => template.key === templateKey) ?? null;
  const missingContact = channel === "email" ? !lead.email : !lead.phone;

  function changeChannel(next: MessageChannel) {
    setChannel(next);
    setTemplateKey("");
    // El resultado anterior ya no describe lo que hay en pantalla: sin esto se
    // leeria "Sent." sobre un formulario nuevo.
    setProviderDown(false);
    send.reset();
  }

  async function submit() {
    if (!templateKey) return;
    const result = await send.run({ channel, templateKey });
    if (result?.ok) {
      setOpen(false);
      setTemplateKey("");
    }
  }

  return (
    <>
      <button
        type="button"
        className="ec-btn-secondary"
        style={{ padding: "8px 14px", fontSize: 13 }}
        onClick={() => setOpen(true)}
      >
        <Send size={13} />
        Send message
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={`Send a message to ${lead.name}`}
        width={560}
        footer={
          <>
            <button type="button" className="ec-btn-secondary" onClick={() => setOpen(false)}>
              Close
            </button>
            <button
              type="button"
              className="ec-btn-primary"
              disabled={!templateKey || missingContact || send.loading}
              onClick={() => void submit()}
            >
              {send.loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Send
            </button>
          </>
        }
      >
        <div className="ec-segmented" style={{ alignSelf: "flex-start" }}>
          {CHANNELS.map((option) => (
            <button
              key={option}
              type="button"
              className={channel === option ? "active" : ""}
              onClick={() => changeChannel(option)}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {CHANNEL_ICON[option]}
              {CHANNEL_LABEL[option]}
            </button>
          ))}
        </div>

        {missingContact ? (
          <p style={{ fontSize: 12.5, color: "var(--ec-danger)" }}>
            This lead has no {channel === "email" ? "email address" : "phone number"} on file.
          </p>
        ) : null}

        <SelectField
          label="Template"
          value={templateKey}
          onChange={setTemplateKey}
          options={forChannel.map((template) => ({ value: template.key, label: template.label }))}
          placeholder={forChannel.length === 0 ? `No ${CHANNEL_LABEL[channel]} templates yet` : "Choose a template"}
          disabled={forChannel.length === 0}
        />

        {forChannel.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "var(--ec-text-muted)" }}>
            No {CHANNEL_LABEL[channel]} templates configured yet. Add one in Settings.
          </p>
        ) : null}

        {selected ? (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--ec-text-muted)",
              border: "1px solid var(--ec-hairline-strong)",
              borderRadius: 10,
              padding: 12,
              whiteSpace: "pre-wrap",
              background: "var(--ec-surface-2)",
            }}
          >
            {selected.subject ? (
              <p style={{ fontWeight: 600, color: "var(--ec-text)", marginBottom: 4 }}>{selected.subject}</p>
            ) : null}
            {selected.body}
            {selected.whatsappTemplateName ? (
              <div style={{ marginTop: 10 }}>
                <Badge tone="warning">Meta template: {selected.whatsappTemplateName}</Badge>
              </div>
            ) : null}
          </div>
        ) : null}

        {send.error ? (
          <InlineResult tone="error">
            {send.error}
            {providerDown
              ? " The provider rejected it, not this app. This is usually temporary — try again in a minute."
              : ""}
          </InlineResult>
        ) : null}
      </Modal>
    </>
  );
}
