import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[clamp(16rem,55vh,34rem)] w-full max-w-3xl flex-col items-center justify-center px-2 py-8 text-center sm:px-6 sm:py-12">
      <span className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand-soft sm:h-14 sm:w-14">
        <SearchX size={24} className="sm:h-7 sm:w-7" aria-hidden="true" />
      </span>
      <p className="font-mono text-sm font-semibold text-cta">404</p>
      <h2 className="mt-2 font-heading text-[clamp(1.5rem,5vw,2.25rem)] font-bold leading-tight text-ink">
        Page not found
      </h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted sm:text-base">
        This page may have moved, or the address may be incorrect.
      </p>
      <Link to="/" className="btn btn-primary mt-6 w-full max-w-xs sm:w-auto">
        Back to dashboard
      </Link>
    </section>
  );
}
