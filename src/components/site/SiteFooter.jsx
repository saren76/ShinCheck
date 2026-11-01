import { Link } from "@tanstack/react-router";
import Logo from "@/components/brand/Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-brand-ink/10 bg-brand-cream-deep/60">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-ink/65">
              A research buddy for people who would rather check than guess. ShinCheck maps what is
              known, what is missing and what still needs verifying.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-ink/50">Workspace</h3>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-brand-ink/75">
              <li>
                <Link to="/" hash="how-it-works" className="hover:text-brand-red">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/demo" className="hover:text-brand-red">
                  Sample analysis
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-red">
                  My research
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-ink/50">Good to know</h3>
            <ul className="mt-3 space-y-2 text-sm text-brand-ink/65">
              <li>Sample results are simulated and clearly labelled.</li>
              <li>Every claim links back to the source it came from.</li>
              <li>We never invent dates, amounts or sources.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t-2 border-brand-ink/10 pt-6 text-xs text-brand-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ShinCheck. Research support, not professional advice.</p>
          <p>Cartoon mascot artwork is original to ShinCheck.</p>
        </div>
      </div>
    </footer>
  );
}