import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--ec-bg)] flex items-center justify-center p-4 relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--ec-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--ec-grid-line) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="ec-project-card max-w-[420px] w-full cursor-default text-center p-12 shadow-[var(--ec-shadow-lg)]">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-[var(--ec-brand-soft)] animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[var(--ec-brand-soft)] opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-[400] text-[var(--ec-brand)]">
            ?
          </span>
        </div>

        <h1 className="font-serif text-5xl font-[400] text-[var(--ec-text)] mb-1">
          404
        </h1>

        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--ec-text-dim)] mb-5">
          Page not found
        </p>

        <div className="w-8 h-0.5 bg-[var(--ec-brand)] opacity-50 mx-auto mb-5 rounded" />

        <p className="text-sm text-[var(--ec-text-muted)] leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <Link
          href="/"
          className="ec-btn-primary inline-flex items-center gap-2 px-7 py-3 text-[13px] font-semibold tracking-[0.06em] no-underline"
        >
          <span className="text-base leading-none">←</span>
          BACK HOME
        </Link>

        <div className="flex justify-center gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--ec-hairline-strong)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
