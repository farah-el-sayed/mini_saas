import { Link } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorPage({ onRetry, onHome }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-canvas px-4 py-8 text-ink sm:py-10">
      <section
        role="alert"
        className="card w-full max-w-lg p-4 text-center sm:p-8"
      >
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertCircle size={28} aria-hidden="true" />
        </span>
        <p className="font-mono text-sm font-semibold uppercase tracking-wide text-danger">
          Something went wrong
        </p>
        <h1 className="mt-2 font-heading text-[clamp(1.4rem,6vw,1.75rem)] font-bold leading-tight text-ink">
          We couldn’t load this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          An unexpected error occurred. Try reloading the app or return to the
          dashboard.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={onRetry} className="btn btn-primary w-full sm:w-auto">
            <RefreshCw size={16} aria-hidden="true" />
            Reload app
          </button>
          <Link to="/" onClick={onHome} className="btn btn-ghost w-full sm:w-auto">
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
