"use client";

import axios from "axios";
import { getToken, notifyUnauthorized } from "./token-store";
import type {
  ActionResult,
  AutomationRule,
  CrmUser,
  DashboardPayload,
  Lead,
  LeadDetailPayload,
  LeadSource,
  MessageChannel,
  MessageTemplate,
  SettingsPayload,
  Task,
} from "./types";

// El dashboard corre en e-commetrics.com y la API vive en reformadental.com, asi
// que esto es siempre una peticion cross-origin. Va hardcodeado por el mismo
// motivo que en el calendario (calendar-reforma/page.tsx): el build es un export
// estatico, sin API routes ni reescrituras que sirvan de proxy.
//
// OJO: no usar NEXT_PUBLIC_URL. Esa es la API del propio dashboard.
export const CRM_API = "https://reformadental.com/crm";

const http = axios.create({ baseURL: CRM_API, timeout: 20000 });

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // El token va en el header, no en la cookie. La cookie del backend es
    // SameSite=None, o sea de terceros, y Safari ya la bloquea: si dependiera
    // de ella el login fallaria en parte de los navegadores sin avisar.
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Sesion caducada o token invalido. El token-store avisa a la sesion para
      // que vuelva al login en vez de dejar la pantalla en error permanente.
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** Saca un mensaje legible de un error de axios. El backend siempre manda { error }. */
export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { error?: string } | undefined;
    if (body?.error) return body.error;
    if (error.code === "ECONNABORTED") return "The CRM API timed out.";
    if (!error.response) return "Could not reach the CRM API.";
    return `${error.response.status} ${error.response.statusText || "error"}`;
  }
  return error instanceof Error ? error.message : fallback;
}

/**
 * Codigo HTTP de un fallo, o null si no hubo respuesta.
 *
 * La UI lo necesita para distinguir "el proveedor esta caido" (502 en /send y
 * en las herramientas) de "la peticion estaba mal" (400/404). Los dos casos
 * devuelven `ok: false` y solo el status los separa.
 */
export function statusOf(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.status ?? null;
}

// ─── Sesion ──────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
  // Va sin Authorization a proposito: es la unica peticion que no tiene token.
  const { data } = await http.post<{ user: CrmUser; token: string }>("/login", { email, password });
  return data;
}

export async function apiMe(): Promise<CrmUser | null> {
  const { data } = await http.get<{ user: CrmUser | null }>("/me");
  return data.user;
}

export async function apiLogout(): Promise<void> {
  // La cookie del backend se limpia aqui. El token en memoria lo borra quien
  // llama, asi que un fallo de red no debe impedir cerrar sesion.
  await http.post("/logout").catch(() => undefined);
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function apiListLeads(): Promise<Lead[]> {
  const { data } = await http.get<{ leads: Lead[] }>("/leads");
  return data.leads ?? [];
}

export async function apiCreateLead(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  source: LeadSource;
}): Promise<Lead> {
  const { data } = await http.post<{ lead: Lead }>("/leads", input);
  return data.lead;
}

export async function apiGetLead(id: string): Promise<LeadDetailPayload> {
  const { data } = await http.get<LeadDetailPayload>(`/leads/${encodeURIComponent(id)}`);
  return data;
}

/** Solo admite `stage` y `notes`. Cualquier otra cosa se ignora en el backend. */
export async function apiPatchLead(
  id: string,
  patch: { stage?: string; notes?: string }
): Promise<Lead> {
  const { data } = await http.patch<{ lead: Lead }>(`/leads/${encodeURIComponent(id)}`, patch);
  return data.lead;
}

export async function apiSendMessage(
  id: string,
  channel: MessageChannel,
  templateKey: string
): Promise<ActionResult> {
  const { data } = await http.post<ActionResult>(`/leads/${encodeURIComponent(id)}/send`, {
    channel,
    templateKey,
  });
  return data;
}

/**
 * Descarga el CSV. No puede ser un <a href>: el token va en un header, y una
 * navegacion no lleva headers. Por eso se pide el texto y se fabrica el archivo
 * en el navegador.
 */
export async function apiExportCsv(): Promise<string> {
  const { data } = await http.get<string>("/leads/export", { responseType: "text" });
  return data;
}

// ─── Tareas ──────────────────────────────────────────────────────────────────
// No hay POST /tasks: las tareas las crean las reglas de automatizacion.

export async function apiListTasks(): Promise<Task[]> {
  const { data } = await http.get<{ tasks: Task[] }>("/tasks");
  return data.tasks ?? [];
}

export async function apiCompleteTask(id: string): Promise<Task> {
  const { data } = await http.patch<{ task: Task }>(`/tasks/${encodeURIComponent(id)}`);
  return data.task;
}

// ─── Dashboard y ajustes ─────────────────────────────────────────────────────

export async function apiDashboard(): Promise<DashboardPayload> {
  const { data } = await http.get<DashboardPayload>("/dashboard");
  return data;
}

export async function apiSettings(): Promise<SettingsPayload> {
  const { data } = await http.get<SettingsPayload>("/settings");
  return data;
}

/** Ojo al parametro: es la `key` de la regla, no un id. */
export async function apiToggleRule(key: string, enabled: boolean): Promise<AutomationRule> {
  const { data } = await http.patch<{ rule: AutomationRule }>(
    `/settings/rules/${encodeURIComponent(key)}`,
    { enabled }
  );
  return data.rule;
}

/** El body llama `text` al cuerpo del mensaje; la columna se llama `body`. */
export async function apiSaveTemplate(input: {
  key: string;
  channel: MessageChannel;
  text: string;
  subject?: string;
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
}): Promise<MessageTemplate> {
  const { data } = await http.patch<{ template: MessageTemplate }>("/settings/templates", input);
  return data.template;
}

// ─── Herramientas ───────────────────────────────────────────────────────────
// Estas cinco mueven datos y gastan APIs de terceros. Responden 502 cuando el
// proveedor falla, que es distinto de un 4xx de "no hiciste bien la peticion":
// la UI lo muestra como "reintentable", no como error de la app.

export async function apiSync(): Promise<{ ok: boolean; fetched: number; created: number; error?: string }> {
  const { data } = await http.post<{ ok: boolean; fetched: number; created: number; error?: string }>("/sync");
  return data;
}

export async function apiCheckToken(): Promise<{
  tokenValid: boolean | null;
  tokenCheckedAt: string | null;
  tokenCheckError: string | null;
}> {
  const { data } = await http.post<{
    tokenValid: boolean | null;
    tokenCheckedAt: string | null;
    tokenCheckError: string | null;
  }>("/check-token");
  return data;
}

export async function apiCapiTest(leadId: string): Promise<ActionResult> {
  const { data } = await http.post<ActionResult>("/capi-test", { leadId });
  return data;
}

export async function apiMessagingTest(channel: MessageChannel, to: string): Promise<ActionResult> {
  const { data } = await http.post<ActionResult>("/messaging-test", { channel, to });
  return data;
}

export async function apiImportCsv(csv: string): Promise<{ created: number }> {
  const { data } = await http.post<{ created: number }>("/import-csv", { csv });
  return data;
}
