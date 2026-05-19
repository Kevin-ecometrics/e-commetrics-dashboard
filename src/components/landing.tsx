"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Packages from "@/components/packages";
import { useLang } from "@/app/context/LangContext";

type Locale = "en" | "es";

type Skill = {
  id: number;
  title: string;
  percent: number;
  icon: React.ReactNode;
  description: string;
};

type Service = {
  id: number;
  key: string;
  title: string;
  description: string;
  desc2: string;
  banner: string;
};

type ConsultingItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  icon: string;
  hoverColor: string;
};

const Hero = ({ locale }: { locale: Locale }) => {
  const words =
    locale === "en"
      ? ["Simplify", "Elevate", "Innovate", "E-commetrics"]
      : ["Simplifica", "Eleva", "Innova", "E-commetrics"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2000); // Change word every 2 seconds
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <motion.section
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: "linear-gradient(to left, #BD155C, #1E171E)",
      }}
    >
      <h1
        className="text-white font-extrabold text-5xl md:text-7xl mb-3 drop-shadow-lg"
        style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
      >
        <motion.span
          key={currentWordIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {words[currentWordIndex]}
        </motion.span>
      </h1>
      <p
        className="text-white text-xl md:text-2xl max-w-3xl"
        style={{ color: "#E2D8F9" }}
      >
        {locale === "en"
          ? "Smart websites. Consulting and development in one place."
          : "Páginas web inteligentes. Consultoría y desarrollo en un solo lugar."}
      </p>
    </motion.section>
  );
};

const Skills = ({ locale }: { locale: Locale }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null);
  const [percentages, setPercentages] = useState<number[]>([]);

  const animationRef = useRef<number | null>(null);

  const skillsEcommetrics: Skill[] = [
    {
      id: 1,
      title:
        locale === "en" ? "Strategic Consulting" : "Consultoría Estratégica",
      percent: 100,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      description:
        locale === "en"
          ? "Our recipe for success ensures safe planning based on projections and results."
          : "Nuestra receta para el éxito garantiza una planificación segura sobre proyecciones y resultados.",
    },
    {
      id: 2,
      title:
        locale === "en"
          ? "Google and Meta Optimization"
          : "Optimización de Google y Meta",
      percent: 100,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"
          />
        </svg>
      ),
      description:
        locale === "en"
          ? "GOOGLE owns more than 93% of search intent and Instagram is where everyone is."
          : "GOOGLE posee más del 93% de la intención de búsqueda e Instagram es donde todos están.",
    },
    {
      id: 3,
      title:
        locale === "en"
          ? "Marketing and Sales Automation"
          : "Automatización de Marketing y Ventas",
      percent: 100,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      description:
        locale === "en"
          ? "Improve lead acquisition and conversions with top-tier growth hacking techniques."
          : "Mejora la adquisición de leads y conversiones con técnicas de growth hacking de primer nivel.",
    },
    {
      id: 4,
      title: locale === "en" ? "Corporate Analytics" : "Análisis Corporativo",
      percent: 100,
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      description:
        locale === "en"
          ? "Gain precise knowledge and time to capture inbound leads and sell nonstop."
          : "Obtén conocimiento preciso y tiempo para captar leads entrantes y vender sin parar.",
    },
  ];

  // Inicializar porcentajes en cero al montar
  useEffect(() => {
    setPercentages(skillsEcommetrics.map(() => 0));
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Cancelar animación previa si existe
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (hoveredSkill !== null) {
      let current = 0;
      const target = skillsEcommetrics[hoveredSkill].percent;

      const animate = () => {
        current += 2;
        if (current > target) current = target;

        setPercentages((prev) =>
          prev.map((p, i) => (i === hoveredSkill ? current : 0))
        );

        if (current < target) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    } else {
      // Resetear todos los porcentajes a 0
      setPercentages(skillsEcommetrics.map(() => 0));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hoveredSkill]);

  return (
    <motion.div
      className="bg-white text-black grid grid-cols-1 md:grid-cols-2 px-8 md:px-24 gap-10 text-balance py-16 items-start"
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div>
        <p className="text-2xl md:text-3xl font-bold mb-8">
          {locale === "en"
            ? "How to do it right online?"
            : "¿Cómo hacerlo bien en línea?"}
        </p>
        <h2 className="text-3xl md:text-5xl font-semibold mb-8 text-gray-600">
          {locale === "en"
            ? "A recipe for everything you've imagined!"
            : "¡Una receta para todo lo que has imaginado!"}
        </h2>
        <p className="mb-8 text-xl">
          {locale === "en"
            ? "With over 10 years of e-Commerce experience, we've guided brands and companies through their digital transformation, creating visually sophisticated, technologically innovative, and multifunctional websites and web applications."
            : "En más de 10 años de experiencia en e-Commerce hemos acompañado a marcas y empresas a lo largo de su transformación digital creando sitios web y aplicaciones web visualmente sofisticados, tecnológicamente innovadores y multifuncionales."}
        </p>
        <span className="block text-gray-700 text-xl">
          {locale === "en"
            ? "You'll walk in your own digital ecosystem, putting your business alongside your customers' and consumers' Visas and Mastercards."
            : "Caminarás en tu propio ecosistema digital poniendo tu negocio al lado de las Visas y Mastercards de tus Clientes y Consumidores."}
        </span>
      </div>

      <div>
        {skillsEcommetrics.map((skill, idx) => (
          <motion.div
            key={skill.id}
            className="bg-gray-100 p-4 rounded-lg mb-4 shadow-md cursor-pointer"
            onMouseEnter={() => setHoveredSkill(idx)}
            onMouseLeave={() => setHoveredSkill(null)}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, x: 40 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 * idx }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#861453] to-[#6a0f43] rounded-lg p-2">
                  {skill.icon}
                </div>
                <h3 className="text-2xl font-semibold">{skill.title}</h3>
              </div>
              <span className="text-3xl font-bold">{percentages[idx]}%</span>
            </div>
            <p className="text-gray-700">{skill.description}</p>
            <div className="mt-2 bg-gray-300 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-[#861453] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: hoveredSkill === idx ? `${percentages[idx]}%` : "0%",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Services = ({ locale }: { locale: Locale }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getServiceIcon = (key: string): React.ReactNode => {
    switch (key) {
      case "video":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "brand":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case "writing":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case "web":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        );
      case "webapp":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        );
      case "desing":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        );
      case "ecommerce":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case "planning":
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        );
      default:
        return (
          <svg className="w-7 h-7 text-[#861453]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
          </svg>
        );
    }
  };

  const serviceEcommetrics: Service[] = [
    { id: 1, key: "video", title: locale === "en" ? "Video Production" : "Video producción", description: locale === "en" ? "We design and execute all key processes of pre-production, production, and post-production." : "Diseñamos y ejecutamos todos los procesos clave de preproducción, producción y post producción...", desc2: locale === "en" ? "We design and execute all key processes of pre-production, production, and post-production to transform our clients' vision into reality, adapting to the required format." : "Diseñamos y ejecutamos todos los procesos clave de preproducción, producción y post producción para transformar la visión de nuestros clientes en realidad, adaptándonos al formato requerido.", banner: "https://ecommetrica.com/banner1.webp" },
    { id: 2, key: "brand", title: locale === "en" ? "Brand Identity" : "Identidad de marca", description: locale === "en" ? "Beyond a logo, we unify name, colors, and marketing strategy." : "Mas allá de un logo unificamos nombre, colores y estrategia de marketing...", desc2: locale === "en" ? "Beyond a logo, we unify name, colors, and marketing strategy to achieve a powerful visual coherence that resonates with consumers." : "Más allá de un logo, unificamos nombre, colores y estrategia de marketing para lograr una coherencia visual poderosa que resuene con los consumidores.", banner: "https://ecommetrica.com/banner2.webp" },
    { id: 3, key: "writing", title: locale === "en" ? "Creative Writing" : "Escritura creativa", description: locale === "en" ? "We give soul and personality to your brand or business." : "Le damos alma y personalidad a tu marca o negocio...", desc2: locale === "en" ? "We give soul and personality to your brand or business while playing with imagination and creativity to create narratives and stories that connect with people." : "Le damos alma y personalidad a tu marca o negocio mientras jugamos con la imaginación y creatividad para crear narrativas e historias que conecten con las personas.", banner: "https://ecommetrica.com/banner3.webp" },
    { id: 4, key: "web", title: locale === "en" ? "Web Positioning" : "Posicionamiento Web", description: locale === "en" ? "We boost your business in search engines. We design comprehensive strategies." : "Impulsamos tu negocio en motores de búsqueda. Diseñamos estrategias integrales...", desc2: locale === "en" ? "We boost your business on search engines. We design comprehensive strategies that maximize lead retention and conversion." : "Impulsamos tu negocio en motores de búsqueda. Diseñamos estrategias integrales que maximizan la retención y conversión de leads.", banner: "https://ecommetrica.com/banner4.webp" },
    { id: 5, key: "webapp", title: locale === "en" ? "Programming and WebApps" : "Programación y webApps", description: locale === "en" ? "We develop impactful and adaptable websites and online stores." : "Desarrollamos páginas y tiendas en línea impactantes y adaptables...", desc2: locale === "en" ? "We develop impactful and adaptable online pages and stores that grow with you." : "Desarrollamos páginas y tiendas en línea impactantes y adaptables que crecen contigo.", banner: "https://ecommetrica.com/banner5.webp" },
    { id: 6, key: "desing", title: locale === "en" ? "Web Design" : "Diseño web", description: locale === "en" ? "We focus on providing a great user experience (UX) and interface design." : "Nos enfocamos en brindar una experiencia de usuario UX y diseño interfaz...", desc2: locale === "en" ? "We focus on providing a user experience (UX) and interface design that stands out from the rest." : "Nos enfocamos en brindar una experiencia de usuario (UX) y diseño de interfaz que destaque del resto.", banner: "https://ecommetrica.com/banner6.webp" },
    { id: 7, key: "ecommerce", title: "E-commerce", description: locale === "en" ? "We specialize in B2C, B2B, and guide you step by step." : "Nos especializamos en B2C, B2B, te guiamos paso a paso...", desc2: locale === "en" ? "We specialize in B2C, B2B. We guide you step by step to design a strategic plan that drives your growth." : "Nos especializamos en B2C, B2B. Te guiamos paso a paso para diseñar un plan estratégico que impulse tu crecimiento.", banner: "https://ecommetrica.com/banner7.webp" },
    { id: 8, key: "planning", title: locale === "en" ? "Strategic Planning" : "Planeación estratégica", description: locale === "en" ? "We focus on your business growth and help you identify opportunities." : "Nos enfocamos en el crecimiento de tu negocio, te ayudamos a identificar oportunidades...", desc2: locale === "en" ? "We focus on the growth of your business, helping you identify improvement opportunities and implement strategies." : "Nos enfocamos en el crecimiento de tu negocio, ayudándote a identificar oportunidades de mejora.", banner: "https://ecommetrica.com/banner8.webp" },
  ];

  return (
    <div className="bg-white text-black px-8 md:px-24 gap-10 text-balance py-16 items-start grid grid-cols-1 md:grid-cols-2">
      <div>
        <p className="text-2xl md:text-3xl font-bold mb-8">
          {locale === "en"
            ? "Ready to bring your projects to life"
            : "Listos para dar vida a tus proyectos"}
        </p>
        <h1 className="text-3xl md:text-5xl font-semibold mb-8 text-gray-600">
          {locale === "en" ? "Our Services" : "Nuestros Servicios"}
        </h1>
        <span className="block mb-8 text-xl">
          {locale === "en"
            ? "In addition to our consulting service, we are passionate about creating strategies and technology for different businesses with a multidisciplinary team in digital marketing and production."
            : "Además de nuestro servicio de consultoría, nos apasiona crear estrategias y tecnología para diferentes negocios con un equipo multidisciplinario en marketing digital y producción."}
        </span>
      </div>
      {serviceEcommetrics.map((service) => (
        <motion.div
          key={service.id}
          className="bg-gray-100 p-4 rounded-lg mb-4 shadow-md cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => setSelectedService(service)}
        >
          <div className="flex items-center gap-4 mb-4">
            {getServiceIcon(service.key)}
            <h3 className="text-3xl font-semibold">{service.title}</h3>
          </div>
          <p className="text-gray-700 mb-4 text-lg">{service.description}</p>
          <span className="w-16 h-2 bg-gradient-to-r from-[#861453] via-purple-900 to-[#1a0933] mb-6 rounded-full block " />
        </motion.div>
      ))}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-0 max-w-lg w-full shadow-xl relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="w-full h-40 md:h-56 relative">
                <Image
                  src={selectedService.banner}
                  alt={selectedService.title}
                  fill
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  loader={({ src }) => src}
                />
              </div>
              <button
                className="absolute top-3 right-3 text-gray-500 bg-white rounded-full px-2 hover:text-[#861453] text-2xl z-10"
                onClick={() => setSelectedService(null)}
                aria-label="Cerrar"
              >
                &times;
              </button>
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  {getServiceIcon(selectedService.key)}
                  <h3 className="text-3xl font-semibold">
                    {selectedService.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-lg">{selectedService.desc2}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="col-span-1 flex flex-col items-center mt-8">
        <h2 className="text-2xl font-bold mb-2">
          {locale === "en" ? "Any questions?" : "¿Alguna pregunta?"}
        </h2>
        <p className="mb-4 text-lg">
          {locale === "en" ? "We love to answer" : "Nos encanta responder"}
        </p>
        <button
          className="bg-[#861453] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#BD155C] transition-colors"
          onClick={() => window.open("mailto:admin@e-commetrics.com", "_blank")}
        >
          {locale === "en" ? "Ask" : "Preguntar"}
        </button>
      </div>
    </div>
  );
};

const Consulting = ({ locale }: { locale: Locale }) => {
  const consultingEcommetrics: ConsultingItem[] = [
    { id: 1, title: locale === "en" ? "Programming" : "Programación", desc: locale === "en" ? "Fast and secure websites." : "Páginas Web, rápida y segura.", image: "https://ecommetrica.com/programacion.webp", icon: "https://ecommetrica.com/MarketingIcon.svg", hoverColor: "bg-gradient-to-br from-blue-500/80 to-purple-600/10" },
    { id: 2, title: locale === "en" ? "Marketing" : "Marketing", desc: locale === "en" ? "We provide the best S.S.L. with NameCheap." : "Tenemos el mejor S.S.L. con NameCheap.", image: "https://ecommetrica.com/marketing.webp", icon: "https://ecommetrica.com/MarketingIcon.svg", hoverColor: "bg-gradient-to-br from-purple-600/80 to-black/10" },
    { id: 3, title: "SEO", desc: locale === "en" ? "Your site will be better structured for Google©." : "Tu sitio estará mejor estructurado para Google©.", image: "https://ecommetrica.com/SEO.webp", icon: "https://ecommetrica.com/SeoIcon.svg", hoverColor: "bg-gradient-to-br from-violet-700/80 to-purple-900/10" },
    { id: 4, title: "Web Master", desc: locale === "en" ? "Fast, secure and reliable hosting." : "Hospedaje rápido, seguro y confiable.", image: "https://ecommetrica.com/webMaster.webp", icon: "https://ecommetrica.com/WebMasterIcon.svg", hoverColor: "bg-gradient-to-br from-pink-500/80 to-rose-600/10" },
  ];

  return (
    <div className="bg-gradient-to-tr from-[#BD155C] to-[#1E171E] px-8 md:px-24 gap-10 text-balance py-16 items-start text-white">
      <h1 className="text-center font-extrabold text-3xl mb-4">
        {locale === "en"
          ? "What's Inside Ecommetrica's Consulting?"
          : "¿Qué hay Dentro de la Consultoría de Ecommetrica?"}
      </h1>
      <p className="text-center mb-8 text-2xl">
        {locale === "en"
          ? "In any package you get:"
          : "En cualquier paquete tienes:"}
      </p>
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 px-8 gap-12 cursor-pointer">
        {consultingEcommetrics.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4 }}
            className="p-6 shadow rounded-3xl relative h-96 w-80 group bg-cover bg-no-repeat bg-center overflow-hidden flex items-end justify-start"
            style={{ backgroundImage: `url('${item.image}')` }}
          >
            {/* Overlay base */}
            <div className="absolute inset-0 bg-black/60 z-0 group-hover:opacity-0 transition-opacity duration-300" />

            {/* Overlay de color en hover */}
            <div
              className={`absolute inset-0 ${item.hoverColor} opacity-0 group-hover:opacity-100 transition-all duration-300 z-0`}
            />

            <div className="relative z-10">
              <Image
                src={item.icon}
                alt={item.title}
                title={item.title}
                height={48}
                width={48}
                loading="lazy"
                className="mb-4"
              />
              <h3 className="text-3xl font-semibold mb-2 text-white">
                {item.title}
              </h3>
              <p className="text-white mt-2 text-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const Footer = ({ locale, goToLogin }: { locale: Locale; goToLogin: () => void }) => (
  <motion.footer
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 0.7 }}
    className="text-center py-6 min-h-32 flex justify-center items-center text-white"
    style={{
      background: "linear-gradient(to left, #BD155C, #1E171E)",
    }}
  >
    <p className="text-sm mb-8">
      {locale === "en"
        ? `E-commetrics © ${new Date().getFullYear()} All rights reserved.`
        : `E-commetrics © ${new Date().getFullYear()} Todos los derechos reservados.`}
    </p>
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
      <button
        onClick={goToLogin}
        className="text-sm bg-white text-[#BD155C] hover:bg-[#BD155C] px-8 py-2 hover:text-white rounded-xl transition-colors"
      >
        {locale === "en" ? "Go to Login" : "Ir a Iniciar Sesión"}
      </button>
    </div>
  </motion.footer>
);

export default function Landing({ goToLogin }: { goToLogin: () => void }) {
  const { lang, changeLang } = useLang();

  useEffect(() => {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    const cookieLang = match?.[2];
    if (cookieLang === "en" || cookieLang === "es") {
      changeLang(cookieLang as Locale);
    }
  }, []);

  const toggleLocale = () => {
    const newLocale: Locale = lang === "en" ? "es" : "en";
    changeLang(newLocale);
    document.cookie = `lang=${newLocale}; path=/; max-age=31536000`;
  };

  return (
    <div className="relative min-h-screen">
      {/* Botón de idioma */}
      <div className="absolute top-8 right-8 z-50">
        <button
          onClick={toggleLocale}
          className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:scale-110 transition-transform bg-white"
          title={lang === "en" ? "Cambiar a Español" : "Switch to English"}
          aria-label="Cambiar idioma"
        >
          {lang === "en" ? (
            <figure>
              <Image
                src="/MX.svg"
                width={36}
                height={36}
                alt="Bandera de México"
              />
            </figure>
          ) : (
            <figure>
              <Image src="/USA.svg" width={36} height={36} alt="USA Flag" />
            </figure>
          )}
        </button>
      </div>

      <Hero locale={lang as Locale} />
      <Skills locale={lang as Locale} />
      <Services locale={lang as Locale} />
      <Packages locale={lang as Locale} />
      <Consulting locale={lang as Locale} />
      <Footer locale={lang as Locale} goToLogin={goToLogin} />
    </div>
  );
}
