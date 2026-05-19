"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaStore,
  FaSearch,
  FaGlobe,
  FaChartLine,
  FaMagic,
  FaVideo,
  FaMobileAlt,
  FaBullhorn,
  FaPalette,
  FaRobot,
  FaLightbulb,
  FaCode,
} from "react-icons/fa";
import { MdEmail, MdPhone, MdOpenInNew } from "react-icons/md";
import axios from "axios";

type Locale = "en" | "es";

type ServiceItem = {
  name: string;
  details: string;
};

type ExtraItem = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type ExtraCategory = {
  category: string;
  items: ExtraItem[];
};

type Package = {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  overview: string;
  services: ServiceItem[];
  additionalDetails: string[];
  popular?: boolean;
  extraServices: ExtraCategory[];
};

// Diccionario de íconos por tipo de servicio
const iconMap: Record<string, React.ReactNode> = {
  sitio: <FaGlobe className="text-[#BD155C]" />,
  seo: <FaSearch className="text-[#BD155C]" />,
  redes: <FaChartLine className="text-[#BD155C]" />,
  analytics: <FaChartLine className="text-[#BD155C]" />,
  ecommerce: <FaStore className="text-[#BD155C]" />,
  diseño: <FaPalette className="text-[#BD155C]" />,
  publicidad: <FaBullhorn className="text-[#BD155C]" />,
  branding: <FaMagic className="text-[#BD155C]" />,
  apps: <FaMobileAlt className="text-[#BD155C]" />,
  automatizacion: <FaRobot className="text-[#BD155C]" />,
  consultoria: <FaLightbulb className="text-[#BD155C]" />,
  audiovisual: <FaVideo className="text-[#BD155C]" />,
  desarrollo: <FaCode className="text-[#BD155C]" />,
  default: <FaCheckCircle className="text-[#BD155C]" />,
};

// Detecta qué ícono usar
const getIcon = (text: string): React.ReactNode => {
  const t = text.toLowerCase();
  if (t.includes("seo")) return iconMap.seo;
  if (t.includes("redes")) return iconMap.redes;
  if (t.includes("analytics") || t.includes("pixel")) return iconMap.analytics;
  if (t.includes("shopify") || t.includes("ecommerce")) return iconMap.ecommerce;
  if (t.includes("reels") || t.includes("posts")) return iconMap.diseño;
  if (t.includes("publicidad")) return iconMap.publicidad;
  if (t.includes("branding")) return iconMap.branding;
  if (t.includes("app")) return iconMap.apps;
  if (t.includes("automatización")) return iconMap.automatizacion;
  if (t.includes("consultoría")) return iconMap.consultoria;
  if (t.includes("audiovisual")) return iconMap.audiovisual;
  if (t.includes("personalizado")) return iconMap.desarrollo;
  if (t.includes("sitio web")) return iconMap.sitio;
  return iconMap.default;
};

// Información de los paquetes
const packagesData: Record<Locale, Package[]> = {
  es: [
    {
      id: 1,
      title: "Plan Inicial",
      subtitle: "Para los recién llegados",
      price: "$675/por 3 meses",
      description: "Incluye Paquete Básico",
      overview: "Un paquete ideal para establecer presencia en línea.",
      services: [
        { name: "Sitio Web Básico", details: "Desarrollo de una landing page en React o Astro según necesidad o templete en Shopify." },
        { name: "SEO Inicial", details: "Optimización básica en motores de búsqueda para mejorar visibilidad." },
        { name: "Configuración de Redes Sociales", details: "Creación y optimización de perfiles en redes sociales principales." },
        { name: "Google Analytics & Facebook Pixel", details: "Configuración de herramientas de seguimiento para análisis de tráfico." },
      ],
      additionalDetails: ["Ideal para emprendedores que están comenzando.", "Soporte técnico básico incluido.", "Entrega en un plazo de 2 semanas."],
      extraServices: [
        { category: "Diseño", items: [{ id: "diseno-premium", name: "Diseño Premium", price: 150, description: "Paquete de diseño visual mejorado con gráficos personalizados" }] },
        { category: "Desarrollo", items: [{ id: "pagina-adicional", name: "Página Adicional", price: 75, description: "Añadir una página más a tu sitio web" }] },
      ],
    },
    {
      id: 2,
      title: "Plan Pro",
      subtitle: "Para pequeñas empresas y emprendedores",
      price: "$995/por 4 meses",
      description: "Incluye Paquete Básico más:",
      overview: "Un paquete avanzado para pequeñas empresas.",
      services: [
        { name: "Ecommerce con Shopify", details: "Configuración y personalización de tienda en Shopify con diseño profesional." },
        { name: "SEO Avanzado", details: "Optimización técnica y estrategia de contenido para posicionamiento orgánico." },
        { name: "Sitio Web Avanzado", details: "Desarrollo de una landing page en React o Astro según necesidad con desarrollo avanzado." },
        { name: "Diseño de Posts & Reels", details: "Creación de contenido visual optimizado para redes sociales." },
      ],
      additionalDetails: ["Incluye análisis de mercado para estrategias de SEO.", "Soporte técnico avanzado.", "Entrega en un plazo de 4 semanas.", "Este es el paquete más popular entre nuestros clientes."],
      popular: true,
      extraServices: [
        { category: "SEO", items: [{ id: "seo-avanzado", name: "SEO Avanzado", price: 300, description: "Estrategia SEO integral para mejores rankings" }, { id: "optimizacion-contenido", name: "Optimización de Contenido", price: 250, description: "Optimiza el contenido de tu sitio web para motores de búsqueda" }] },
        { category: "Marketing", items: [{ id: "campana-email", name: "Campaña de Email", price: 180, description: "Crear y gestionar campañas de email marketing" }] },
      ],
    },
    {
      id: 3,
      title: "Plan Empresa",
      subtitle: "Para empresas pequeñas con ambiciones",
      price: "$1185/por 6 meses",
      description: "Incluye Paquete Pro más:",
      overview: "Un paquete diseñado para empresas en expansión.",
      services: [
        { name: "Desarrollo Web Personalizado", details: "Creación de un sitio web en React o Astro con diseño a medida." },
        { name: "Estrategia en Redes Sociales", details: "Gestión de contenido con planificación mensual y analítica avanzada." },
        { name: "Publicidad Digital", details: "Campañas en Google Ads, Facebook Ads e Instagram con segmentación avanzada." },
        { name: "Branding & Diseño Gráfico", details: "Diseño de identidad visual en Figma, Photoshop e Illustrator." },
      ],
      additionalDetails: ["Incluye análisis detallado de métricas de campañas.", "Soporte técnico premium.", "Entrega en un plazo de 6 semanas."],
      extraServices: [
        { category: "Analítica", items: [{ id: "analisis-trafico", name: "Análisis de Tráfico", price: 120, description: "Análisis detallado del tráfico del sitio web y el comportamiento del usuario" }, { id: "seguimiento-conversiones", name: "Seguimiento de Conversiones", price: 150, description: "Seguimiento y optimización de tasas de conversión" }] },
      ],
    },
    {
      id: 4,
      title: "Plan Personalizado",
      subtitle: "Para empresas grandes y corporativos",
      price: "$1555/por 8 meses",
      description: "Incluye Paquete Empresa más:",
      overview: "Un paquete completo para grandes corporaciones.",
      services: [
        { name: "Consultoría Estratégica", details: "Asesoramiento personalizado para expansión digital y crecimiento." },
        { name: "Automatización de Marketing", details: "Estrategias omnicanal para posicionamiento premium en el mercado." },
        { name: "Producción Audiovisual", details: "Videograbación y edición profesional para campañas publicitarias." },
        { name: "Desarrollo de Apps", details: "Aplicaciones web y móviles personalizadas para optimizar procesos internos." },
      ],
      additionalDetails: ["Incluye soporte dedicado 24/7.", "Entrega en un plazo de 8 semanas.", "Acceso a herramientas exclusivas de análisis de datos."],
      extraServices: [
        { category: "Desarrollo", items: [{ id: "formulario-contacto", name: "Formulario de Contacto", price: 100, description: "Formulario de contacto con notificaciones por email" }] },
        { category: "Marketing", items: [{ id: "anuncios-redes", name: "Anuncios en Redes Sociales", price: 220, description: "Ejecutar anuncios dirigidos en plataformas de redes sociales" }] },
      ],
    },
  ],
  en: [
    {
      id: 1,
      title: "Starter Plan",
      subtitle: "For newcomers",
      price: "$675/for 3 months",
      description: "Includes Basic Package",
      overview: "An ideal package to establish an online presence.",
      services: [
        { name: "Basic Website", details: "Development of a landing page in React or Astro based on needs or Shopify template." },
        { name: "Initial SEO", details: "Basic optimization in search engines to improve visibility." },
        { name: "Social Media Setup", details: "Creation and optimization of profiles on major social networks." },
        { name: "Google Analytics & Facebook Pixel", details: "Setup of tracking tools for traffic analysis." },
      ],
      additionalDetails: ["Ideal for entrepreneurs starting out.", "Basic technical support included.", "Delivery within 2 weeks."],
      extraServices: [
        { category: "Design", items: [{ id: "diseno-premium", name: "Premium Design", price: 150, description: "Enhanced visual design package with custom graphics" }] },
        { category: "Development", items: [{ id: "pagina-adicional", name: "Additional Page", price: 75, description: "Add one more page to your website" }] },
      ],
    },
    {
      id: 2,
      title: "Pro Plan",
      subtitle: "For small businesses and entrepreneurs",
      price: "$995/for 4 months",
      description: "Includes Basic Package plus:",
      overview: "An advanced package for small businesses.",
      services: [
        { name: "Shopify Ecommerce", details: "Setup and customization of a Shopify store with professional design." },
        { name: "Advanced SEO", details: "Technical optimization and content strategy for organic positioning." },
        { name: "Advanced Website", details: "Development of a landing page in React or Astro with advanced development." },
        { name: "Post & Reel Design", details: "Creation of visually optimized content for social media." },
      ],
      additionalDetails: ["Includes market analysis for SEO strategies.", "Advanced technical support.", "Delivery within 4 weeks.", "This is the most popular package among our clients."],
      popular: true,
      extraServices: [
        { category: "SEO", items: [{ id: "seo-avanzado", name: "Advanced SEO", price: 300, description: "Comprehensive SEO strategy for better rankings" }, { id: "optimizacion-contenido", name: "Content Optimization", price: 250, description: "Optimize your website content for search engines" }] },
        { category: "Marketing", items: [{ id: "campana-email", name: "Email Campaign", price: 180, description: "Create and manage email marketing campaigns" }] },
      ],
    },
    {
      id: 3,
      title: "Business Plan",
      subtitle: "For growing businesses",
      price: "$1185/for 6 months",
      description: "Includes Pro Package plus:",
      overview: "A package designed for expanding businesses.",
      services: [
        { name: "Custom Web Development", details: "Creation of a website in React or Astro with tailored design." },
        { name: "Social Media Strategy", details: "Content management with monthly planning and advanced analytics." },
        { name: "Digital Advertising", details: "Campaigns on Google Ads, Facebook Ads, and Instagram with advanced targeting." },
        { name: "Branding & Graphic Design", details: "Visual identity design in Figma, Photoshop, and Illustrator." },
      ],
      additionalDetails: ["Includes detailed campaign metrics analysis.", "Premium technical support.", "Delivery within 6 weeks."],
      extraServices: [
        { category: "Analytics", items: [{ id: "analisis-trafico", name: "Traffic Analysis", price: 120, description: "Detailed analysis of website traffic and user behavior" }, { id: "seguimiento-conversiones", name: "Conversion Tracking", price: 150, description: "Track and optimize conversion rates" }] },
      ],
    },
    {
      id: 4,
      title: "Corporate Plan",
      subtitle: "For large enterprises",
      price: "$1555/for 8 months",
      description: "Includes Business Package plus:",
      overview: "A complete package for large corporations.",
      services: [
        { name: "Strategic Consulting", details: "Personalized advice for digital expansion and growth." },
        { name: "Marketing Automation", details: "Omnichannel strategies for premium market positioning." },
        { name: "Audiovisual Production", details: "Professional video recording and editing for advertising campaigns." },
        { name: "App Development", details: "Custom web and mobile applications to optimize internal processes." },
      ],
      additionalDetails: ["Includes 24/7 dedicated support.", "Delivery within 8 weeks.", "Access to exclusive data analysis tools."],
      extraServices: [
        { category: "Development", items: [{ id: "formulario-contacto", name: "Contact Form", price: 100, description: "Contact form with email notifications" }] },
        { category: "Marketing", items: [{ id: "anuncios-redes", name: "Social Media Ads", price: 220, description: "Run targeted ads on social media platforms" }] },
      ],
    },
  ],
};

const Packages = ({ locale }: { locale: Locale }) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const packages = packagesData[locale] || [];
  const pkgSelected = packages.find((p) => p.id === selectedPackage);

  const extraServices = pkgSelected?.extraServices || [];

  const basePrice = pkgSelected
    ? Number((pkgSelected.price.match(/[\d.]+/) || [0])[0])
    : 0;

  const extrasTotal = selectedExtras.reduce((sum, id) => {
    for (const cat of extraServices) {
      const found = cat.items.find((item) => item.id === id);
      if (found) return sum + found.price;
    }
    return sum;
  }, 0);

  const totalPrice = basePrice + extrasTotal;

  const handleExtraChange = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSelectPackage = (id: number) => {
    setSelectedPackage(id);
    setSelectedExtras([]);
  };

  const selectedExtrasInfo = extraServices
    .flatMap((cat) => cat.items)
    .filter((item) => selectedExtras.includes(item.id));

  const isEmailValid = email.includes("@");

  const handleSendEmail = async () => {
    if (!pkgSelected) return;
    setSending(true);
    setError(null);
    setSent(false);
    try {
      await axios.post("https://e-commetrics.com/send-package-email", {
        locale,
        package: {
          title: pkgSelected.title,
          price: pkgSelected.price,
          services: pkgSelected.services,
          additionalDetails: pkgSelected.additionalDetails,
        },
        extras: selectedExtrasInfo,
        total: totalPrice,
        email,
      });
      setSent(true);
      setEmail("");
    } catch {
      setError("Error al enviar el correo.");
    }
    setSending(false);
  };

  return (
    <div className="px-4 md:px-20 py-16 bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-[#BD155C]">
        {locale === "es" ? "Nuestros Paquetes" : "Our Packages"}
      </h2>

      {!selectedPackage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative bg-white ${
                pkg.popular ? "border-[#BD155C]" : "border-gray-200"
              }`}
            >
              <h3 className="text-2xl font-bold text-[#BD155C]">{pkg.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{pkg.subtitle}</p>
              <p className="text-3xl font-extrabold text-gray-900">{pkg.price}</p>
              <p className="text-gray-700 mt-4">{pkg.overview}</p>
              {pkg.popular && (
                <span className="text-sm text-white bg-[#BD155C] px-3 py-1 rounded-full absolute top-4 right-4">
                  {locale === "es" ? "Más Popular" : "Most Popular"}
                </span>
              )}
              <button
                onClick={() => handleSelectPackage(pkg.id)}
                className="mt-6 w-full text-white bg-[#BD155C] hover:bg-[#BD155C]/90 px-4 py-2 rounded-lg font-medium"
              >
                {locale === "es" ? "Ver Detalles" : "View Details"}
              </button>
            </div>
          ))}
        </div>
      )}

      {pkgSelected && (
        <motion.div
          key={pkgSelected.id}
          className="mt-16 p-8 rounded-xl shadow-lg bg-gradient-to-r from-purple-50 to-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl font-extrabold text-[#BD155C] mb-6 text-center">
            {pkgSelected.title}
          </h3>
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {locale === "es" ? "Servicio" : "Service"}
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  {locale === "es" ? "Detalles" : "Details"}
                </th>
              </tr>
            </thead>
            <tbody>
              {pkgSelected.services.map((service, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 flex items-center gap-2">
                    {getIcon(service.name)}
                    {service.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{service.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-[#BD155C] mb-4">
              {locale === "es" ? "Ventajas" : "Advantages"}
            </h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              {pkgSelected.additionalDetails.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>

          {/* Servicios adicionales */}
          {extraServices.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-[#BD155C] mb-2">
                {locale === "es" ? "Servicios Adicionales" : "Additional Services"}
              </h4>
              {extraServices.map((cat) => (
                <div key={cat.category} className="mb-4">
                  <div className="font-bold mb-1">{cat.category}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2 hover:shadow transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedExtras.includes(item.id)}
                          onChange={() => handleExtraChange(item.id)}
                          className="mt-1"
                        />
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="ml-2 text-[#BD155C] font-semibold">+${item.price}</span>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Precio total y botón de resumen */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <span className="text-lg font-bold text-[#BD155C]">
              {locale === "es" ? "Total:" : "Total:"} ${totalPrice}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="text-white bg-[#BD155C] hover:bg-[#BD155C]/90 px-6 py-2 rounded-lg font-medium"
            >
              {locale === "es" ? "Ver Resumen" : "View Summary"}
            </button>
            <button
              onClick={() => setSelectedPackage(null)}
              className="text-[#BD155C] underline font-medium"
            >
              {locale === "es" ? "Volver" : "Back"}
            </button>
          </div>

          {/* Modal de resumen */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-4 cursor-pointer z-20 text-2xl hover:text-[#BD155C]/60 text-[#BD155C] font-bold"
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <h3 className="text-2xl font-bold text-[#BD155C] mb-4 text-center">
                  {locale === "es" ? "Resumen de tu paquete" : "Your Package Summary"}
                </h3>
                {/* Input para el correo */}
                <div className="mb-4">
                  <label className="block font-semibold mb-1 text-[#BD155C]">
                    {locale === "es"
                      ? "Tu correo electrónico para recibir el resumen:"
                      : "Your email to receive the summary:"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale === "es" ? "ejemplo@correo.com" : "your@email.com"}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BD155C]"
                    required
                    disabled={sending}
                  />
                </div>
                <div className="mb-2">
                  <span className="font-semibold">{pkgSelected.title}</span>
                  <span className="ml-2 text-gray-600">{pkgSelected.price}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">
                    {locale === "es" ? "Incluye:" : "Includes:"}
                  </span>
                  <ul className="list-disc pl-5 text-gray-700 text-sm">
                    {pkgSelected.services.map((service, idx) => (
                      <li key={idx}>{service.name}</li>
                    ))}
                  </ul>
                </div>
                {selectedExtrasInfo.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold">
                      {locale === "es" ? "Servicios Adicionales:" : "Additional Services:"}
                    </span>
                    <ul className="list-disc pl-5 text-gray-700 text-sm">
                      {selectedExtrasInfo.map((item) => (
                        <li key={item.id}>
                          {item.name}{" "}
                          <span className="text-[#BD155C]">+${item.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 text-right">
                  <span className="text-lg font-bold text-[#BD155C]">
                    {locale === "es" ? "Total:" : "Total:"} ${totalPrice}
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={handleSendEmail}
                    disabled={sending || !isEmailValid}
                    className={`w-full text-white bg-[#BD155C] hover:bg-[#BD155C]/90 px-4 py-2 rounded-lg font-medium ${
                      !isEmailValid || sending ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {sending
                      ? locale === "es" ? "Enviando..." : "Sending..."
                      : locale === "es" ? "Enviar por correo" : "Send by Email"}
                  </button>
                  {sent && (
                    <div className="text-green-600 text-center">
                      {locale === "es" ? "¡Correo enviado correctamente!" : "Email sent successfully!"}
                    </div>
                  )}
                  {error && <div className="text-red-600 text-center">{error}</div>}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="mt-16 text-center text-gray-700 space-y-4">
        <p className="flex justify-center items-center gap-2 flex-col md:flex-row">
          <MdEmail className="text-[#BD155C] hidden md:block" />
          <strong>{locale === "es" ? "Correo electrónico:" : "Email:"}</strong>{" "}
          <a href="mailto:juanmanuel@ecommetrica.com" className="text-[#BD155C] underline hover:text-pink-700 transition-colors">
            juanmanuel@ecommetrica.com
          </a>
        </p>
        <p className="flex justify-center items-center gap-2 flex-col md:flex-row">
          <MdPhone className="text-[#BD155C] hidden md:block" />
          <strong>{locale === "es" ? "Teléfono:" : "Phone:"}</strong>{" "}
          <a href="tel:+526646429633" className="text-[#BD155C] underline hover:text-pink-700 transition-colors">
            +52 664 6429 633
          </a>
        </p>
        <p className="flex justify-center items-center gap-2 md:flex-row flex-col">
          <MdOpenInNew className="text-[#BD155C] hidden md:block" />
          <span>
            {locale === "es"
              ? "Para checar más a detalle los paquetes, revisa mi otro sitio web:"
              : "To see the packages in more detail, check out my other website:"}
          </span>{" "}
          <a href="https://ecommetrica.com/" target="_blank" rel="noopener noreferrer" className="text-[#BD155C] underline hover:text-pink-700 transition-colors">
            ecommetrica.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default Packages;
