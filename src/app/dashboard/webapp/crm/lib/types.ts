// Tipos del CRM, espejando server/crm/types.js del backend de Reforma Dental.
//
// El backend esta en JS plano con JSDoc, asi que estos tipos son la unica
// garantia de que ambos lados hablan el mismo idioma. Si cambias una forma aqui,
// cambiala tambien en server/crm/types.js.
//
// Diferencias conscientes con el CRM original en Next.js (repo CRM):
//   - AutomationRule ya no tiene `id`. La PK en MySQL es `key` ("new_lead_call_task"),
//     estable y sin nanoid, para que el seed sea idempotente. El PATCH de reglas
//     va por /settings/rules/:key.

export type LeadSource = "facebook" | "manual" | "csv";

export interface Lead {
  id: string;
  fbLeadgenId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  campaignName: string | null;
  adName: string | null;
  formName: string | null;
  fieldDataRaw: Record<string, unknown> | null;
  stage: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  color: string;
}

export type ActivityType =
  | "note"
  | "stage_change"
  | "system"
  | "message_sent"
  | "message_failed"
  | "capi_sent"
  | "capi_failed";

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  leadId: string;
  description: string;
  dueAt: string;
  done: boolean;
  createdAt: string;
}

export type RuleTrigger = "new_lead" | "stage_change" | "stale_contacted";
export type RuleAction = "create_task" | "send_message";
export type MessageChannel = "email" | "sms" | "whatsapp";

export interface AutomationRule {
  key: string;
  label: string;
  trigger: RuleTrigger;
  action: RuleAction;
  enabled: boolean;
  config: {
    stage?: string;
    delayHours?: number;
    staleHours?: number;
    channel?: MessageChannel;
    templateKey?: string;
    taskDescription?: string;
  };
}

export interface MessageTemplate {
  key: string;
  channel: MessageChannel;
  label: string;
  subject?: string;
  body: string;
  // Cuando estan puestos, el envio usa la API de plantillas de Meta y funciona
  // fuera de la ventana de 24h. Deben coincidir exactamente con una plantilla
  // Approved en Meta; un nombre mal escrito falla en vez de degradar a texto libre.
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
}

export interface SyncState {
  lastSyncAt: string | null;
  lastError: string | null;
  lastCapiAt: string | null;
  lastCapiError: string | null;
  tokenValid: boolean | null;
  tokenCheckedAt: string | null;
  tokenCheckError: string | null;
}

export interface CrmUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Que integraciones tiene variables de entorno puestas. No prueba que respondan. */
export interface ConfiguredFlags {
  facebookLeadSync: boolean;
  facebookCapi: boolean;
  facebookCapiTestMode: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface SettingsPayload {
  automationRules: AutomationRule[];
  templates: MessageTemplate[];
  syncState: SyncState;
  stages: Stage[];
  configured: ConfiguredFlags;
}

export interface DashboardPayload {
  totalLeads: number;
  leadsByStage: { id: string; name: string; color: string; count: number }[];
  leadsBySource: { facebook: number; manual: number; csv: number };
  tasksOpen: number;
  tasksOverdue: number;
  messagesSent: number;
  messagesFailed: number;
  conversionRate: number;
  conversionStageName: string | null;
}

export interface LeadDetailPayload {
  lead: Lead;
  activities: Activity[];
  tasks: Task[];
}

/** Respuesta comun de los endpoints que operan algo y podem fallar. */
export interface ActionResult {
  ok: boolean;
  error?: string;
}
