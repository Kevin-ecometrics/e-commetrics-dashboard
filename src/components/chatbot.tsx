/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MessageCircle, X } from "lucide-react";
import { useLang } from "@/app/context/LangContext";

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatOption {
  id: string;
  text: string;
  response: string;
  followUp?: string[];
}

const TYPING_DELAY = 1200;
const RESPONSE_DELAY = 800;

const chatOptionsES: ChatOption[] = [
  {
    id: "contact",
    text: "📞 ¿Cómo puedo contactarlos?",
    response:
      "📞 Puedes contactarnos de estas maneras:\n\n• Teléfono: +52 664 642 9633\n• Email: juanmanuel@e-commetrics.com\n• WhatsApp: +52 664 642 9633\n\nHorario: Lunes a Sábado 9AM - 7PM",
    followUp: [
      "💬 ¿Cuál es el mejor horario para llamar?",
      "📧 ¿Responden rápido por email?",
    ],
  },
  {
    id: "location",
    text: "📍 ¿Dónde están ubicados?",
    response:
      "📍 Nuestra oficina está ubicada en:\n\nCalle Ignacio Zaragoza, Gustavo Madero 8169-306, 22000 Tijuana, B.C.\n\n🚗 Contamos con estacionamiento disponible",
    followUp: [
      "🗺️ ¿Pueden enviar indicaciones?",
      "🚌 ¿Hay transporte público cercano?",
    ],
  },
  {
    id: "services",
    text: "❓ ¿Qué servicios ofrecen?",
    response:
      "✨ Nuestros principales servicios:\n\n• Desarrollo de software personalizado\n• Consultoría tecnológica\n• Soporte técnico 24/7\n• Capacitación empresarial\n• Análisis de datos\n• Automatización de procesos\n\n¿Te interesa algún servicio específico?",
    followUp: [
      "💻 Desarrollo web",
      "📊 Análisis de datos",
      "🤖 Automatización",
    ],
  },
  {
    id: "dashboard-help",
    text: "📊 Necesito ayuda con el dashboard",
    response:
      "🔍 Parece que tienes problemas para acceder o usar el dashboard.\n\nPosibles causas:\n• No has iniciado sesión\n• Tu sesión ha expirado\n• Hay un error con las cookies\n\n💡 Solución: Intenta refrescar la página, borrar cookies o iniciar sesión nuevamente.",
    followUp: ["🔑 ¿Cómo inicio sesión?", "❌ ¿Cómo borrar cookies?"],
  },
];

const chatOptionsEN: ChatOption[] = [
  {
    id: "contact",
    text: "📞 How can I contact you?",
    response:
      "📞 You can contact us in the following ways:\n\n• Phone: +52 664 642 9633\n• Email: juanmanuel@e-commetrics.com\n• WhatsApp: +52 664 642 9633\n\nHours: Monday to Saturday 9AM - 7PM",
    followUp: [
      "💬 What's the best time to call?",
      "📧 Do you respond quickly by email?",
    ],
  },
  {
    id: "location",
    text: "📍 Where are you located?",
    response:
      "📍 Our office is located at:\n\nCalle Ignacio Zaragoza, Gustavo Madero 8169-306, 22000 Tijuana, B.C.\n\n🚗 Parking available",
    followUp: [
      "🗺️ Can you send directions?",
      "🚌 Is there public transport nearby?",
    ],
  },
  {
    id: "services",
    text: "❓ What services do you offer?",
    response:
      "✨ Our main services:\n\n• Custom software development\n• Technology consulting\n• 24/7 technical support\n• Business training\n• Data analysis\n• Process automation\n\nAre you interested in a specific service?",
    followUp: ["💻 Web development", "📊 Data analysis", "🤖 Automation"],
  },
  {
    id: "dashboard-help",
    text: "📊 I need help with the dashboard",
    response:
      "🔍 It seems you're having trouble accessing or using the dashboard.\n\nPossible causes:\n• You are not logged in\n• Your session has expired\n• There is an error with cookies\n\n💡 Solution: Try refreshing the page, clearing cookies, or logging in again.",
    followUp: ["🔑 How do I log in?", "❌ How to clear cookies?"],
  },
];

function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showOptions, setShowOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const options = useMemo(
    () => (lang === "es" ? chatOptionsES : chatOptionsEN),
    [lang]
  );

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const LangChange = () => {
    if (lang === "es") {
      setMessages([
        {
          id: Date.now(),
          text: "¡Hola! 👋 Soy tu asistente virtual de E-commetrics. ¿En qué puedo ayudarte hoy?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setUnreadCount(0);
    } else {
      setMessages([
        {
          id: Date.now(),
          text: "Hi! 👋 I'm your virtual assistant from E-commetrics. How can I help you today?",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    LangChange();
  }, [lang]);

  // Handle option click
  const handleOptionClick = useCallback(
    (option: ChatOption) => {
      if (!hasInteracted) setHasInteracted(true);

      const userMessage: ChatMessage = {
        id: Date.now(),
        text: option.text,
        isBot: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setShowOptions(false);
      setIsTyping(true);

      // Scroll to bottom after user message
      setTimeout(() => {
        scrollToBottom();
      }, 100);

      const typingTimer = setTimeout(() => {
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          text: option.response,
          isBot: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);

        // Scroll to bottom after bot message
        setTimeout(() => {
          scrollToBottom();
        }, 100);

        const optionsTimer = setTimeout(() => {
          setShowOptions(true);
          // Scroll to bottom after showing options
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }, RESPONSE_DELAY);

        return () => clearTimeout(optionsTimer);
      }, TYPING_DELAY);

      return () => clearTimeout(typingTimer);
    },
    [hasInteracted, scrollToBottom]
  );

  // Handle chat open
  const handleChatOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  // Handle chat close
  const handleChatClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Simulate new message notification when closed
  useEffect(() => {
    if (!isOpen && !hasInteracted) {
      const timer = setTimeout(() => {
        setUnreadCount(1);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, hasInteracted]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 text-black"
      ref={chatContainerRef}
    >
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="relative">
          <button
            onClick={handleChatOpen}
            className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label={
              lang === "es" ? "Abrir chat de soporte" : "Open support chat"
            }
          >
            <MessageCircle
              size={28}
              className="transition-transform group-hover:scale-110"
            />

            {/* Pulse animation */}
            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>

            {/* Unread count badge */}
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold animate-bounce">
                {unreadCount}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200 transform transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center relative shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="Logo"
                  className="size-8 rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="font-semibold text-lg">
                  {lang === "es" ? "Soporte" : "Support"}
                </span>
                <p className="text-blue-100 text-xs">
                  {lang === "es" ? "En línea ahora" : "Online now"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Close Button */}
              <button
                onClick={handleChatClose}
                className="hover:bg-blue-600 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label={lang === "es" ? "Cerrar chat" : "Close chat"}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area - Prioritized with more space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0 scroll-smooth">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                } animate-in slide-in-from-bottom-2 fade-in`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.isBot
                      ? "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                  }`}
                >
                  <div
                    className={`text-sm leading-relaxed whitespace-pre-line ${
                      message.isBot ? "text-gray-800" : "text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-2 opacity-70 ${
                      message.isBot ? "text-gray-500" : "text-blue-100"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {lang === "es" ? "escribiendo..." : "typing..."}
                  </span>
                </div>
              </div>
            )}

            {/* Spacer to ensure proper scrolling */}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Options Area - No scroll, fixed display */}
          {showOptions && !isTyping && messages.length > 0 && (
            <div className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 p-3 rounded-b-2xl shrink-0">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  {lang === "es"
                    ? "¿Necesitas algo más?"
                    : "Need anything else?"}
                </p>
                <div className="grid gap-1.5">
                  {options.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      className="w-full text-left px-3 py-2 text-xs bg-white hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 group"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <span className="block font-medium text-gray-700 group-hover:text-blue-700 transition-colors leading-snug">
                        {option.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer - More compact */}
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-b-2xl shrink-0">
            <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <span className="opacity-75">
                {lang === "es" ? "Desarrollado por" : "Developed by"}
              </span>
              <span className="font-bold text-blue-600">E-commetrics</span>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedChatbot;
