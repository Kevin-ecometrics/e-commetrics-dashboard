"use client";

import { useMemo, useState } from "react";
import { Loader2, RefreshCw, Send, Upload, Zap } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  apiCapiTest,
  apiCheckToken,
  apiImportCsv,
  apiListLeads,
  apiMessagingTest,
  apiSettings,
  apiSync,
  apiToggleRule,
  statusOf,
} from "../lib/api";
import { useMutation, useResource } from "../lib/hooks";
import { CHANNEL_LABEL, formatDateTime } from "../lib/format";
import type { Lead, MessageChannel, MessageTemplate, SettingsPayload } from "../lib/types";
import { TemplateEditor } from "../components/TemplateEditor";
import {
  Badge,
  ErrorNotice,
  InlineResult,
  Loading,
  PageHeader,
  Section,
  SelectField,
  Switch,
  TextAreaField,
  TextField,
} from "../components/ui";

type Tone = "ok" | "error" | "muted";

/** Ajustes: integraciones, reglas, plantillas y las cuatro herramientas de operacion. */
export function SettingsScreen() {
  const settings = useResource("settings", apiSettings);
  const leads = useResource("leads", apiListLeads);

  if (settings.loading && !settings.data) return <Loading label="Loading settings…" />;
  if (settings.error && !settings.data) {
    return (
      <div style={{ padding: 28 }}>
        <ErrorNotice message={settings.error} onRetry={settings.reload} />
      </div>
    );
  }

  const data = settings.data;
  if (!data) return <Loading />;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: 28 }}>
      <PageHeader
        eyebrow="⎯⎯⎯  CONFIGURATION"
        title="Settings"
        subtitle="Integration status, automation rules and the operational tools."
      />

      <Section title="Integration status">
        <IntegrationStatus data={data} />
      </Section>

      <Section title="Automation rules">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {data.automationRules.map((rule) => (
            <RuleRow key={rule.key} ruleKey={rule.key} label={rule.label} detail={`trigger: ${rule.trigger} · action: ${rule.action}`} enabled={rule.enabled} />
          ))}
        </ul>
        <p style={{ fontSize: 11.5, color: "var(--ec-text-dim)", marginTop: 10 }}>
          Rules can be switched on and off. Their configuration is not editable from here — change it in
          <code> server/crm/db/seed.js</code> and re-run the seed.
        </p>
      </Section>

      <Section title="Message templates">
        <Templates templates={data.templates} />
      </Section>

      <Section title="Send a test message">
        <MessagingTest />
      </Section>

      <Section title="Send a test Facebook CAPI event">
        <CapiTest leads={leads.data ?? []} />
      </Section>

      <Section title="Import leads from CSV">
        <CsvImport />
      </Section>
    </div>
  );
}

// ─── Integraciones ───────────────────────────────────────────────────────────

function IntegrationStatus({ data }: { data: SettingsPayload }) {
  const [syncResult, setSyncResult] = useState<{ tone: Tone; text: string } | null>(null);
  const [tokenResult, setTokenResult] = useState<{ tone: Tone; text: string } | null>(null);

  const sync = useMutation(apiSync, {
    onSuccess: (result) => {
      setSyncResult({
        tone: result.ok ? "ok" : "error",
        text: result.ok ? `Synced. Fetched ${result.fetched}, created ${result.created}.` : `Failed: ${result.error}`,
      });
    },
    onError: (message) => setSyncResult({ tone: "error", text: message }),
  });

  const checkToken = useMutation(apiCheckToken, {
    onSuccess: (result) =>
      setTokenResult({
        tone: result.tokenValid ? "ok" : "error",
        text: result.tokenValid
          ? "Token is valid."
          : `Token invalid — ${result.tokenCheckError ?? "no reason given"}`,
      }),
    onError: (message) => setTokenResult({ tone: "error", text: message }),
  });

  const { configured, syncState } = data;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <ConfiguredChip ok={configured.facebookLeadSync} label="Facebook lead sync" />
        {syncState.tokenValid !== null ? (
          <Badge tone={syncState.tokenValid ? "success" : "danger"}>
            Page token: {syncState.tokenValid ? "valid" : "invalid"}
          </Badge>
        ) : null}
        <ConfiguredChip ok={configured.facebookCapi} label="Facebook CAPI" />
        {configured.facebookCapiTestMode ? <Badge tone="warning">CAPI test mode ON</Badge> : null}
        <ConfiguredChip ok={configured.email} label="Email (SMTP)" />
        <ConfiguredChip ok={configured.sms} label="SMS (Twilio)" />
        <ConfiguredChip ok={configured.whatsapp} label="WhatsApp (Meta)" />
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ec-text-muted)", marginBottom: 4 }}>
        Last sync: {formatDateTime(syncState.lastSyncAt)}
        {syncState.lastError ? <span style={{ color: "var(--ec-danger)" }}> — error: {syncState.lastError}</span> : null}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--ec-text-muted)", marginBottom: 4 }}>
        Last CAPI event: {formatDateTime(syncState.lastCapiAt)}
        {syncState.lastCapiError ? <span style={{ color: "var(--ec-danger)" }}> — error: {syncState.lastCapiError}</span> : null}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--ec-text-muted)", marginBottom: 14 }}>
        Last token check: {formatDateTime(syncState.tokenCheckedAt)}
        {syncState.tokenCheckError ? (
          <span style={{ color: "var(--ec-danger)" }}> — error: {syncState.tokenCheckError}</span>
        ) : null}
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          className="ec-btn-secondary"
          style={{ padding: "8px 16px", fontSize: 13 }}
          disabled={sync.loading}
          onClick={() => void sync.run()}
        >
          {sync.loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Sync now
        </button>
        <button
          type="button"
          className="ec-btn-secondary"
          style={{ padding: "8px 16px", fontSize: 13 }}
          disabled={checkToken.loading}
          onClick={() => void checkToken.run()}
        >
          {checkToken.loading ? <Loader2 size={13} className="animate-spin" /> : null}
          Check token
        </button>
      </div>

      {syncResult ? <InlineResult tone={syncResult.tone}>{syncResult.text}</InlineResult> : null}
      {tokenResult ? <InlineResult tone={tokenResult.tone}>{tokenResult.text}</InlineResult> : null}
    </>
  );
}

function ConfiguredChip({ ok, label }: { ok: boolean; label: string }) {
  return <Badge tone={ok ? "success" : "neutral"}>{label}: {ok ? "configured" : "not configured"}</Badge>;
}

// ─── Reglas ──────────────────────────────────────────────────────────────────

function RuleRow({
  ruleKey,
  label,
  detail,
  enabled,
}: {
  ruleKey: string;
  label: string;
  detail: string;
  enabled: boolean;
}) {
  const [local, setLocal] = useState(enabled);
  const toggle = useMutation((next: boolean) => apiToggleRule(ruleKey, next), {
    onError: (message) => {
      toast.error(message);
      // Se revierte: el switch ya estaba visualmente cambiado y el backend no.
      setLocal(enabled);
    },
  });

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        border: "1px solid var(--ec-hairline-strong)",
        borderRadius: 12,
        padding: 14,
        background: "var(--ec-surface-1)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "var(--ec-text-dim)", marginTop: 2 }}>{detail}</div>
        <div className="font-mono-ec" style={{ fontSize: 10, color: "var(--ec-text-faint)", marginTop: 4 }}>
          {ruleKey}
        </div>
      </div>
      <Switch
        checked={local}
        disabled={toggle.loading}
        label={`Enable ${label}`}
        onChange={(next) => {
          setLocal(next);
          void toggle.run(next);
        }}
      />
    </li>
  );
}

// ─── Plantillas ──────────────────────────────────────────────────────────────

function Templates({ templates }: { templates: MessageTemplate[] }) {
  // Se agrupan por key para que las variantes de canal de una misma plantilla
  // queden juntas, que era el criterio del original.
  const groups = useMemo(() => {
    const map = new Map<string, MessageTemplate[]>();
    for (const template of templates) {
      const list = map.get(template.key) ?? [];
      list.push(template);
      map.set(template.key, list);
    }
    return [...map.entries()];
  }, [templates]);

  if (groups.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--ec-text-muted)" }}>
        No templates. Run <code>crm/seed.js</code> on the server.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {groups.map(([key, list]) => (
        <div key={key}>
          <div className="font-mono-ec" style={{ fontSize: 10.5, color: "var(--ec-text-dim)", marginBottom: 9 }}>
            {key}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((template) => (
              <TemplateEditor key={`${template.key}-${template.channel}`} template={template} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Test de mensajería ─────────────────────────────────────────────────────

const TEST_CHANNELS: MessageChannel[] = ["email", "sms", "whatsapp"];

function MessagingTest() {
  const [channel, setChannel] = useState<MessageChannel>("email");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<{ tone: Tone; text: string } | null>(null);
  const [providerDown, setProviderDown] = useState(false);

  const send = useMutation(
    (args: { channel: MessageChannel; to: string }) => apiMessagingTest(args.channel, args.to),
    {
      onSuccess: (res) => {
        setProviderDown(false);
        setResult({ tone: res.ok ? "ok" : "error", text: res.ok ? "Sent." : `Failed: ${res.error}` });
      },
      onError: (message, error) => {
        setProviderDown(statusOf(error) === 502);
        setResult({ tone: "error", text: message });
      },
    }
  );

  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <SelectField
          label="Channel"
          value={channel}
          onChange={(next) => setChannel(next as MessageChannel)}
          options={TEST_CHANNELS.map((option) => ({ value: option, label: CHANNEL_LABEL[option] }))}
          width={150}
        />
        <div style={{ flex: 1, minWidth: 220 }}>
          <TextField
            label="To"
            value={to}
            onChange={setTo}
            placeholder="email or phone with country code"
          />
        </div>
        <button
          type="button"
          className="ec-btn-primary"
          style={{ padding: "10px 18px" }}
          disabled={send.loading || !to.trim()}
          onClick={() => {
            setResult(null);
            void send.run({ channel, to: to.trim() });
          }}
        >
          {send.loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Send test
        </button>
      </div>
      {result ? (
        <InlineResult tone={result.tone}>
          {result.text}
          {providerDown ? " The provider is down, not this app." : ""}
        </InlineResult>
      ) : null}
    </>
  );
}

// ─── Test CAPI ───────────────────────────────────────────────────────────────

function CapiTest({ leads }: { leads: Pick<Lead, "id" | "name">[] }) {
  const [leadId, setLeadId] = useState("");
  const [result, setResult] = useState<{ tone: Tone; text: string } | null>(null);

  const send = useMutation((id: string) => apiCapiTest(id), {
    onSuccess: (res) =>
      setResult({
        tone: res.ok ? "ok" : "error",
        text: res.ok ? "Sent — check Events Manager › Test Events." : `Failed: ${res.error}`,
      }),
    onError: (message) => setResult({ tone: "error", text: message }),
  });

  return (
    <>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <SelectField
          label="Lead"
          value={leadId}
          onChange={setLeadId}
          options={leads.map((lead) => ({ value: lead.id, label: lead.name }))}
          placeholder={leads.length === 0 ? "No leads to test with" : "Choose a lead"}
          disabled={leads.length === 0}
          width={240}
        />
        <button
          type="button"
          className="ec-btn-primary"
          style={{ padding: "10px 18px" }}
          disabled={send.loading || !leadId}
          onClick={() => {
            setResult(null);
            void send.run(leadId);
          }}
        >
          {send.loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Send test event
        </button>
      </div>
      {result ? <InlineResult tone={result.tone}>{result.text}</InlineResult> : null}
    </>
  );
}

// ─── Import CSV ──────────────────────────────────────────────────────────────

const CSV_PLACEHOLDER = "name,email,phone\nJane Doe,jane@example.com,+15550100";

function CsvImport() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<{ tone: Tone; text: string } | null>(null);

  const importCsv = useMutation((text: string) => apiImportCsv(text), {
    onSuccess: (res) => {
      setResult({ tone: "ok", text: `Imported ${res.created} leads.` });
      setCsv("");
    },
    onError: (message) => setResult({ tone: "error", text: message }),
  });

  return (
    <>
      <p style={{ fontSize: 12.5, color: "var(--ec-text-muted)", marginBottom: 10 }}>
        Paste CSV with a header row. Only <code>name</code> is required; the rest are optional.
      </p>
      <TextAreaField value={csv} onChange={setCsv} placeholder={CSV_PLACEHOLDER} rows={5} mono />
      <button
        type="button"
        className="ec-btn-primary"
        style={{ marginTop: 12, padding: "8px 16px", fontSize: 13 }}
        disabled={importCsv.loading || !csv.trim()}
        onClick={() => {
          setResult(null);
          void importCsv.run(csv);
        }}
      >
        {importCsv.loading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
        Import
      </button>
      {result ? <InlineResult tone={result.tone}>{result.text}</InlineResult> : null}
    </>
  );
}
