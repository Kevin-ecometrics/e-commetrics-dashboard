export type Locale = "es" | "en";
export type Region = "mx" | "us";
export type Localized = { es: string; en: string };

export function formatUSD(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export type PlanFeature = {
  text: Localized;
  description?: Localized;
  /** Only shown when region === "us" — inclusions the Mexico tier doesn't carry. */
  usOnly?: boolean;
};

export type Plan = {
  id: string;
  name: Localized;
  tagline: Localized;
  duration: Localized;
  durationMonths: number;
  priceValue: Record<Region, number>;
  serviceCount: Record<Region, number>;
  features: PlanFeature[];
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "simple",
    name: { es: "Arranque", en: "Launch" },
    tagline: {
      es: "Inaugura tu presencia digital completa, bien hecha en 90 días sin plantillas y sin rehacerlo después.",
      en: "Launch your complete digital presence, done right in 90 days, no templates and no redoing it later.",
    },
    duration: { es: "3 meses", en: "3 months" },
    durationMonths: 3,
    priceValue: { mx: 675, us: 1450 },
    serviceCount: { mx: 7, us: 9 },
    features: [
      { text: { es: "Sitio web (React/Astro o Shopify)", en: "Custom website (React, Astro, or Shopify)" } },
      {
        text: { es: "SEO y AEO", en: "SEO and AEO" },
        description: {
          es: "Que en los motores de búsqueda y las IAs hablen de ti desde que inicias.",
          en: "So search engines and AI answers are already talking about you from day one.",
        },
      },
      { text: { es: "Contenido generado con IA", en: "AI-assisted content production" } },
      {
        text: { es: "Configuración de redes sociales", en: "Social profile setup" },
        description: {
          es: "Accesos en orden, todo listo para que pautes sin problema o tengas a tu equipo listo y tu información brindada.",
          en: "Access set up in order, everything ready for you to run ads without friction or to hand your team a fully briefed setup.",
        },
      },
      {
        text: { es: "Google Analytics 4 y Meta Pixel", en: "Google Analytics 4 and Meta Pixel" },
        description: {
          es: "Más que estadísticas, una interpretación para tomar acción y aumentar el retorno de inversión.",
          en: "More than stats — an interpretation you can act on to increase return on investment.",
        },
      },
      { text: { es: "Banner de consentimiento y aviso de privacidad", en: "Consent banner and privacy notice" } },
      { text: { es: "Soporte de hosting y dominios", en: "Hosting and domain support" } },
      { text: { es: "Soporte en horario hábil de EUA", en: "US business-hours support" }, usOnly: true },
      { text: { es: "Gestión de cuenta en inglés", en: "English-language account management" }, usOnly: true },
    ],
  },
  {
    id: "advanced",
    name: { es: "Tracción", en: "Traction" },
    tagline: {
      es: "Empuja a tus leads a pagar su carrito con una experiencia elevada de un sitio web blindado y ágil.",
      en: "Push your leads to check out with an elevated experience — a website that's fast and locked down.",
    },
    duration: { es: "4 meses", en: "4 months" },
    durationMonths: 4,
    priceValue: { mx: 995, us: 2450 },
    serviceCount: { mx: 13, us: 16 },
    features: [
      { text: { es: "Obtén todos los servicios y bases del paquete Arranque", en: "Get every service and foundation from the Launch package" } },
      {
        text: { es: "Tienda Shopify", en: "Shopify store" },
        description: { es: "Pendiente datos de productos.", en: "Pending product data from you." },
      },
      {
        text: { es: "SEO y AEO avanzado", en: "Advanced SEO and AEO" },
        description: {
          es: "Más palabras clave, backlinks, contenido más profundo con estructura que impulsa la visibilidad y citado en las últimas IAs.",
          en: "More keywords, backlinks, and deeper content with a structure that drives visibility and citation in the latest AI models.",
        },
      },
      {
        text: { es: "Branding", en: "Branding" },
        description: {
          es: "Identidad visual y personalidad de marca: logotipo, tipografía, colores y elementos gráficos, tono de comunicación, estilo, etc.",
          en: "Visual identity and brand personality: logo, typography, colors and graphic elements, tone of voice, style, and more.",
        },
      },
      {
        text: { es: "Diseño de contenido para redes", en: "Social content design" },
        description: { es: "Sincronizado con branding y página web.", en: "Synced with your branding and website." },
      },
      {
        text: {
          es: "Sitio web accesible para las personas con discapacidad (Cumplimiento de ADA/WCAG 2.1 AA)",
          en: "Website accessible for people with disabilities (ADA/WCAG 2.1 AA conformance)",
        },
      },
      { text: { es: "Auditoría y remediación", en: "Audit and remediation" } },
      { text: { es: "Declaración de accesibilidad", en: "Accessibility statement" } },
      { text: { es: "Configuración de consentimiento CCPA/CPRA", en: "CCPA/CPRA consent configuration" }, usOnly: true },
    ],
  },
  {
    id: "grower",
    name: { es: "Escala", en: "Scale" },
    tagline: {
      es: "Crecimiento mensual sostenido. Todo a la medida.",
      en: "Sustained monthly growth. Everything built to fit.",
    },
    duration: { es: "6 meses", en: "6 months" },
    durationMonths: 6,
    priceValue: { mx: 1185, us: 3200 },
    serviceCount: { mx: 22, us: 26 },
    featured: true,
    features: [
      { text: { es: "Obtén todos los servicios y bases del paquete Tracción", en: "Get every service and foundation from the Traction package" } },
      { text: { es: "Monitoreo y atención en vivo", en: "Live monitoring and support" } },
      { text: { es: "Desarrollo web a la medida", en: "Custom web development" } },
      { text: { es: "Estrategia de redes con planeación mensual", en: "Monthly social strategy and planning" } },
      { text: { es: "Publicidad digital (Google/Meta)", en: "Paid media (Google/Meta)" } },
      { text: { es: "Branding", en: "Branding" } },
      {
        text: { es: "Producción audiovisual completa", en: "Full video production" },
        description: { es: "Planeación, producción y postproducción.", en: "Planning, production, and post-production." },
      },
      {
        text: { es: "Integraciones de plataforma", en: "Platform integrations" },
        description: {
          es: "Gestión masiva de datos, cliente, reseñas, automatizaciones y métricas de rendimiento y rutas.",
          en: "Bulk management of data, clients, reviews, automations, and performance and routing metrics.",
        },
      },
      { text: { es: "Meta Graph API", en: "Meta Graph API" } },
      { text: { es: "Google Business Profile API", en: "Google Business Profile API" } },
      { text: { es: "Search Console y GA4", en: "Search Console and GA4" } },
      { text: { es: "Sitio bilingüe — inglés y español", en: "Bilingual site — English and Spanish" }, usOnly: true },
    ],
  },
  {
    id: "high-profile",
    name: { es: "Cúspide", en: "Peak" },
    tagline: {
      es: "Deja las tareas manuales y comienza a correr en software y automatización.",
      en: "Leave the manual tasks behind and start running on software and automation.",
    },
    duration: { es: "8 meses", en: "8 months" },
    durationMonths: 8,
    priceValue: { mx: 1555, us: 4500 },
    serviceCount: { mx: 28, us: 34 },
    features: [
      { text: { es: "Obtén todos los servicios y bases del paquete Escala", en: "Get every service and foundation from the Scale package" } },
      { text: { es: "Producción audiovisual cinematográfica (4K)", en: "Cinematic 4K video production" } },
      {
        text: { es: "Automatización de marketing", en: "Marketing automation" },
        description: {
          es: "Correos masivos, respuestas, calendarización sin esfuerzo manual.",
          en: "Bulk email, replies, and scheduling — no manual effort.",
        },
      },
      {
        text: { es: "Dashboard y BI", en: "Dashboard and BI" },
        description: {
          es: "Tu propia web App con todos tus datos, gestión de calendarios, información con los accesos que desees.",
          en: "Your own web app with all your data, calendar management, and information with the access levels you want.",
        },
      },
      { text: { es: "Integraciones con tus sistemas (Hasta 2, API documentada)", en: "System integrations (up to 2, documented API)" } },
      { text: { es: "SLA de soporte prioritario (24 h hábiles)", en: "Priority support SLA (24 business hours)" } },
      { text: { es: "VPAT / Reporte de conformidad", en: "VPAT / Conformance report" } },
      { text: { es: "Entidad contratante en EUA y W-9", en: "US contracting entity and W-9" }, usOnly: true },
      { text: { es: "Sesión presencial trimestral en San Diego", en: "Quarterly on-site in San Diego" }, usOnly: true },
    ],
  },
];

export type CustomPlanModule = { title: Localized; description: Localized };

export type CustomPlan = {
  id: "custom";
  name: Localized;
  tagline: Localized;
  minDuration: Localized;
  priceFromValue: Record<Region, number>;
  totalFromValue: Record<Region, number>;
  modules: CustomPlanModule[];
};

export const customPlan: CustomPlan = {
  id: "custom",
  name: { es: "Aliado", en: "Partner" },
  tagline: {
    es: "Para quien necesita un área de especialidad, no un proveedor.",
    en: "For whoever needs a full area of specialty, not just another vendor.",
  },
  minDuration: { es: "Mínimo 8 meses", en: "Minimum 8 months" },
  priceFromValue: { mx: 2500, us: 6500 },
  totalFromValue: { mx: 20000, us: 52000 },
  modules: [
    {
      title: { es: "Equipo embebido", en: "Embedded team" },
      description: { es: "Capital humano asignado a tu área con operación mensual fija.", en: "Dedicated people assigned to your area with fixed monthly capacity." },
    },
    {
      title: { es: "Roadmap y sprints continuas", en: "Continuous roadmap and sprints" },
      description: { es: "Desarrollo fluido del proyecto: Entregables quincenales contra roadmap.", en: "Smooth, ongoing development: biweekly deliverables against the roadmap." },
    },
    {
      title: { es: "Motor de contenido AEO-first", en: "AEO-first content engine" },
      description: { es: "Contenido en volumen para ser referencia en las IAs y motores de búsqueda.", en: "Content at volume, built to become the reference cited by AI answers and search." },
    },
    {
      title: { es: "Consultoría estratégica", en: "Strategic consulting" },
      description: { es: "Dirección digital: Arquitectura, presupuesto y prioridades.", en: "Digital direction at decision level: architecture, budget, and priorities." },
    },
    {
      title: { es: "App a la medida", en: "Custom application" },
      description: { es: "Desarrollo de software propio.", en: "Development of your own custom software." },
    },
  ],
};

export function planTotal(plan: Plan, region: Region) {
  return plan.priceValue[region] * plan.durationMonths;
}

export function planPerService(plan: Plan, region: Region) {
  return Math.round(plan.priceValue[region] / plan.serviceCount[region]);
}
