import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

export default function NetworkErrorPage({ issue, onRetry, onContinue }) {
  const isOffline = issue === "offline";
  const Icon = isOffline ? WifiOff : AlertTriangle;

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-canvas px-4 py-8 text-ink sm:py-10">
      <section
        role="alert"
        className="card w-full max-w-lg p-4 text-center sm:p-8"
      >
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <Icon size={28} aria-hidden="true" />
        </span>
        <p className="font-mono text-sm font-semibold uppercase tracking-wide text-danger">
          {isOffline ? "Connection lost" : "Connection is too slow"}
        </p>
        <h1 className="mt-2 font-heading text-[clamp(1.4rem,6vw,1.75rem)] font-bold leading-tight text-ink">
          {isOffline ? "You appear to be offline" : "Check your connection"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {isOffline
            ? "Reconnect to the internet, then retry to continue using SubManager."
            : "Your connection may be too slow to load the app reliably. Check your network and try again."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onRetry} className="btn btn-primary w-full sm:w-auto">
            <RefreshCw size={16} aria-hidden="true" />
            Retry connection
          </button>
          <button type="button" onClick={onContinue} className="btn btn-ghost w-full sm:w-auto">
            Continue offline
          </button>
        </div>
      </section>
    </main>
  );
}
