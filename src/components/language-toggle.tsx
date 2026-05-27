"use client";

import { useLang } from "@/app/context/LangContext";

const MxFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: 20, height: 14, borderRadius: 2, flexShrink: 0 }}>
    <path fill="#ce1126" d="M341.3 0H512v512H341.3z"/>
    <path fill="#fff" d="M170.7 0h170.6v512H170.7z"/>
    <path fill="#006847" d="M0 0h170.7v512H0z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m284.6 295.6.2 3.5 1.4-.9-1-3z"/>
    <circle cx="284.5" cy="294.6" r="1.1" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m289 301.1-2.7-2.5-1.2 1 3.6 2z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M288.7 302.6q-.6-1 .3-1.7t1.6.2q.5.9-.3 1.6-.9.6-1.6-.2zm20.3-38.9 2.7 2.6.4-1.3-2.5-1.7z"/>
    <circle cx="308.7" cy="263" r="1.1" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m316.1 265.3-4 1.1.3-1.3 3.5-.4z"/>
    <circle cx="316.8" cy="264.7" r="1.1" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m302.3 285.5-2.5-4 .4-.1 2.9 3.3z"/>
    <circle cx="299.6" cy="280.7" r="1.2" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m302.5 285.6 3.2.6.1-.5-2.7-1z"/>
    <circle cx="306.6" cy="286.2" r="1.1" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M227.7 294.4q-.1 1-.8 1-1-.1-.8-1 .3-1.2.8-1 .8.3.8 1zm0 1.8.7 4-1-.3-.3-3.5z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M228.6 294.9c.4.6-.3 1.5-1.2 1.7-.8.3-1.9-.1-1.9-.9s1.3-.4 1.6-.5c.5-.2 1-1 1.5-.3z"/>
    <ellipse cx="221.6" cy="301" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" rx="1.3" ry=".9"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m223.7 300.8 3.9-.2-.7-.8-3.2.4z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M224 300.4c.4 1 .4 2.3-.7 2.1s-.9-1.1-1-1.5c-.1-.7-.8-1.3-.1-2 .6-.6 1.5.4 1.8 1.4z"/>
    <ellipse cx="211.5" cy="279.4" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" rx=".8" ry="1.1"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m211.5 281.9.1 3.7-1-.9.1-3z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M213 280.8c.2.8-1.1 1.3-2 1.1q-1.4-.2-1.3-1.4c0-.7 1.2-.6 1.5-.4.4.3 1.5-.6 1.8.7z"/>
    <ellipse cx="204.9" cy="285.2" fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" rx="1.3" ry=".6"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="m207.3 285.2 2.9-.2 1.2 1-4.2-.2z"/>
    <path fill="#fcca3e" stroke="#aa8c30" strokeWidth=".2" d="M206.2 283.6c.8 0 1.3.9 1.2 1.8 0 1-.8 1.7-1.5 1.6-.8-.1-.7-.8-.7-1l.5-.8c0-.3-.2-1-.1-1.2q0-.4.6-.4zm-2.4-22.7c-.3.6-1 1-1.2.7q-.4-.5.1-1.4t1.2-.6q.4.4 0 1.3zm-3.2 5.9 1.6-3.9-.2-.2-1.9 2.7z"/>
  </svg>
);

const UsFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: 20, height: 14, borderRadius: 2, flexShrink: 0 }}>
    <path fill="#bd3d44" d="M0 0h512v512H0"/>
    <path stroke="#fff" strokeWidth="40" d="M0 58h512M0 137h512M0 216h512M0 295h512M0 374h512M0 453h512"/>
    <path fill="#192f5d" d="M0 0h390v275H0z"/>
    <marker id="us-a" markerHeight="30" markerWidth="30">
      <path fill="#fff" d="m15 0 9.3 28.6L0 11h30L5.7 28.6"/>
    </marker>
    <path fill="none" markerMid="url(#us-a)" d="m0 0 18 11h65 65 65 65 66L51 39h65 65 65 65L18 66h65 65 65 65 66L51 94h65 65 65 65L18 121h65 65 65 65 66L51 149h65 65 65 65L18 177h65 65 65 65 66L51 205h65 65 65 65L18 232h65 65 65 65 66z"/>
  </svg>
);

export default function LanguageToggle() {
  const { lang, changeLang } = useLang();

  return (
    <button
      onClick={() => changeLang(lang === "es" ? "en" : "es")}
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--ec-hairline)",
        background: "transparent",
        cursor: "pointer",
        transition: "all 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(189,21,92,0.06)";
        e.currentTarget.style.borderColor = "var(--ec-brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "var(--ec-hairline)";
      }}
    >
      {lang === "es" ? <UsFlag /> : <MxFlag />}
    </button>
  );
}
