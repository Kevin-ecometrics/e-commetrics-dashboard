/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, RotateCcw, Bot, MapPin, Phone, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useLang } from "@/app/context/LangContext";

interface ChatAction {
  label: string;
  href: string;
  variant: "maps" | "whatsapp" | "phone" | "email";
}

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  actions?: ChatAction[];
}

const CHAT_API_URL = `${process.env.NEXT_PUBLIC_URL}/api/chat`;

const QUICK_OPTIONS = {
  es: [
    { label: "💻 Desarrollo web",   text: "¿Qué servicios de desarrollo web ofrecen?" },
    { label: "🛒 E-commerce",        text: "¿Qué soluciones de e-commerce tienen?" },
    { label: "📦 Paquetes y precios",text: "¿Cuáles son sus paquetes y precios?" },
    { label: "🔍 SEO y Marketing",   text: "¿Qué servicios de SEO y marketing digital ofrecen?" },
    { label: "📞 Contacto",          text: "¿Cómo puedo contactarlos?" },
    { label: "📍 Ubicación",         text: "¿Dónde están ubicados?" },
  ],
  en: [
    { label: "💻 Web Development",  text: "What web development services do you offer?" },
    { label: "🛒 E-commerce",        text: "What e-commerce solutions do you have?" },
    { label: "📦 Packages & Pricing",text: "What are your packages and pricing?" },
    { label: "🔍 SEO & Marketing",   text: "What SEO and digital marketing services do you offer?" },
    { label: "📞 Contact",           text: "How can I contact you?" },
    { label: "📍 Location",          text: "Where are you located?" },
  ],
};

const WELCOME = {
  es: "¡Hola! 👋 Soy el asistente virtual de **E-commetrics**. Estoy aquí para ayudarte con cualquier pregunta sobre nuestros servicios, ubicación o soporte. ¿En qué puedo ayudarte?",
  en: "Hi! 👋 I'm the virtual assistant of **E-commetrics**. I'm here to help with any questions about our services, location, or support. How can I help you?",
};

const ACTION_CONFIG: Record<ChatAction["variant"], { className: string; icon: React.ReactNode }> = {
  maps: {
    className: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    icon: <MapPin size={12} />,
  },
  whatsapp: {
    className: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
    icon: <FaWhatsapp size={13} />,
  },
  phone: {
    className: "bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100",
    icon: <Phone size={12} />,
  },
  email: {
    className: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    icon: <Mail size={12} />,
  },
};

function detectActions(userText: string, lang: string): ChatAction[] {
  const t = userText.toLowerCase();
  const isLocation = /ubicad|locat|donde|where|direcci|address|mapa|maps|tijuana|san diego/i.test(t);
  const isContact  = /contact|whatsapp|llam|call|tel[eé]fon|phone|email|correo/i.test(t);
  const isPrice    = /precio|cost|cuanto|how much|price|paquete|package|plan|inicial|pro|empresa|personaliz/i.test(t);
  const isService  = /servicio|service|web|ecommerce|e-commerce|seo|marketing|video|marca|brand|redes|social/i.test(t);

  if (isLocation) {
    return [
      {
        label: lang === "es" ? "Tijuana en Maps" : "Tijuana on Maps",
        href: "https://maps.google.com/?q=Tijuana+BC+Mexico+Ecommetrica",
        variant: "maps",
      },
    ];
  }

  if (isPrice || isService) {
    return [
      { label: "WhatsApp", href: "https://wa.me/526646429633", variant: "whatsapp" },
      { label: "Email", href: "mailto:juanmanuel@ecommetrica.com", variant: "email" },
    ];
  }

  if (isContact) {
    return [
      { label: "WhatsApp", href: "https://wa.me/526646429633", variant: "whatsapp" },
      { label: lang === "es" ? "Llamar" : "Call", href: "tel:+526646429633", variant: "phone" },
      { label: "Email", href: "mailto:juanmanuel@ecommetrica.com", variant: "email" },
    ];
  }

  return [];
}

function MessageText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ActionButtons({ actions }: { actions: ChatAction[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-gray-100">
      {actions.map((action, i) => {
        const cfg = ACTION_CONFIG[action.variant];
        return (
          <a
            key={i}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${cfg.className}`}
          >
            {cfg.icon}
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

export default function EnhancedChatbot() {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredId, setHoveredId]     = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const { lang }       = useLang();

  const getWelcome = useCallback(
    (): ChatMessage => ({
      id: Date.now(),
      text: WELCOME[lang as "es" | "en"] ?? WELCOME.es,
      isBot: true,
      timestamp: new Date(),
    }),
    [lang]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    setMessages([getWelcome()]);
    setUnreadCount(0);
  }, [lang, getWelcome]);

  const resetChat = useCallback(() => {
    setMessages([getWelcome()]);
    setInput("");
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [getWelcome]);

  const sendToGroq = useCallback(
    async (userText: string, history: ChatMessage[]) => {
      const apiMessages = history
        .slice(1)
        .map((m) => ({ role: m.isBot ? "assistant" : "user", content: m.text }));
      apiMessages.push({ role: "user", content: userText });

      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: apiMessages, lang }),
      });

      if (!res.ok)
        return lang === "es"
          ? "Lo siento, hubo un error. Intenta de nuevo."
          : "Sorry, there was an error. Please try again.";

      const data = await res.json();
      return data.reply ?? (lang === "es" ? "Sin respuesta." : "No response.");
    },
    [lang]
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const userText = (text ?? input).trim();
      if (!userText || isTyping) return;

      setInput("");

      const userMsg: ChatMessage = {
        id: Date.now(),
        text: userText,
        isBot: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => scrollToBottom(), 50);

      const reply   = await sendToGroq(userText, messages);
      const actions = detectActions(userText, lang);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: reply,
          isBot: true,
          timestamp: new Date(),
          actions: actions.length > 0 ? actions : undefined,
        },
      ]);
      setIsTyping(false);
      setTimeout(() => scrollToBottom(), 50);
    },
    [input, isTyping, messages, lang, sendToGroq, scrollToBottom]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend]
  );

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setUnreadCount((c) => (c === 0 ? 1 : c)), 5000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const quickOptions = QUICK_OPTIONS[lang as "es" | "en"] ?? QUICK_OPTIONS.es;

  const brand = "#BD155C";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setUnreadCount(0); setTimeout(() => inputRef.current?.focus(), 100); }}
          style={{
            background: `linear-gradient(135deg, ${brand}, #8a0f44)`,
            border: "none",
          }}
          className="group text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none relative"
          aria-label={lang === "es" ? "Abrir chat" : "Open chat"}
        >
          <MessageCircle size={28} className="transition-transform group-hover:scale-110" />
          <span
            style={{ background: brand }}
            className="absolute inset-0 rounded-full opacity-20 animate-ping pointer-events-none"
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col border animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ height: "min(640px, calc(100vh - 6rem))", borderColor: "var(--ec-hairline)", background: "var(--ec-bg)" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 rounded-t-2xl flex items-center gap-3 shrink-0 text-white"
            style={{ background: `linear-gradient(135deg, ${brand}, #8a0f44)` }}
          >
            <div className="relative shrink-0">
              <img src="/logo.jpg" alt="E-commetrics" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2" style={{ borderColor: brand }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">E-commetrics</p>
              <p className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                {lang === "es" ? "Asistente IA · En línea" : "AI Assistant · Online"}
              </p>
            </div>
            <button
              onClick={resetChat}
              title={lang === "es" ? "Nueva conversación" : "New chat"}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none"
              aria-label={lang === "es" ? "Cerrar" : "Close"}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-0" style={{ background: "var(--ec-surface-1)" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.isBot ? "justify-start" : "justify-end"}`}
                onMouseEnter={() => setHoveredId(msg.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {msg.isBot && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 shadow-sm" style={{ background: brand }}>
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className={`flex flex-col gap-0.5 ${msg.isBot ? "max-w-[80%]" : "max-w-[78%]"}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.isBot
                        ? "rounded-bl-sm"
                        : "rounded-br-sm text-white"
                    }`}
                    style={{
                      background: msg.isBot ? "var(--ec-bg)" : brand,
                      color: msg.isBot ? "var(--ec-text)" : "#fff",
                      border: msg.isBot ? "1px solid var(--ec-hairline)" : "none",
                    }}
                  >
                    <MessageText text={msg.text} />
                    {msg.isBot && msg.actions && <ActionButtons actions={msg.actions} />}
                  </div>
                  <span
                    className={`text-[10px] px-1 transition-opacity duration-150 ${
                      hoveredId === msg.id ? "opacity-100" : "opacity-0"
                    } ${msg.isBot ? "text-left" : "text-right"}`}
                    style={{ color: "var(--ec-text-dim)" }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: brand }}>
                  <Bot size={14} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5" style={{ background: "var(--ec-bg)", border: "1px solid var(--ec-hairline)" }}>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s`, background: brand }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick options — 2-column grid, always visible */}
          <div className="shrink-0 px-3 pt-2 pb-2" style={{ borderTop: "1px solid var(--ec-hairline)", background: "var(--ec-bg)" }}>
            <p className="text-[10px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--ec-text-dim)" }}>
              {lang === "es" ? "Preguntas frecuentes" : "Quick questions"}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {quickOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(opt.text)}
                  disabled={isTyping}
                  className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left truncate focus:outline-none"
                  style={{
                    borderColor: "var(--ec-hairline)",
                    background: "var(--ec-surface-2)",
                    color: "var(--ec-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${brand}0f`;
                    e.currentTarget.style.borderColor = brand;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--ec-surface-2)";
                    e.currentTarget.style.borderColor = "var(--ec-hairline)";
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 pt-2 pb-3 rounded-b-2xl" style={{ borderTop: "1px solid var(--ec-hairline)", background: "var(--ec-bg)" }}>
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === "es" ? "Escribe tu mensaje..." : "Type your message..."}
                disabled={isTyping}
                maxLength={500}
                className="flex-1 text-sm rounded-xl px-3 py-2 focus:outline-none disabled:opacity-50 placeholder-gray-400"
                style={{
                  border: "1px solid var(--ec-hairline)",
                  background: "var(--ec-surface-2)",
                  color: "var(--ec-text)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = brand; e.currentTarget.style.boxShadow = `0 0 0 2px ${brand}20`; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ec-hairline)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus:outline-none text-white active:scale-95"
                style={{ background: brand }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                aria-label={lang === "es" ? "Enviar" : "Send"}
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: "var(--ec-text-dim)" }}>
              {lang === "es" ? "Desarrollado por" : "Powered by"}{" "}
              <span style={{ color: brand, fontWeight: 500 }}>E-commetrics</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
