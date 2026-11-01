
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, LogOut } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/lib/AuthContext";

const LINKS = [
  { label: "How it works", to: "/", hash: "how-it-works" },
  { label: "Sample analysis", to: "/demo" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoadingAuth, logout } = useAuth();

  async function handleLogout() {
    await logout();
    setOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-brand-ink/10 bg-brand-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="ShinCheck home" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={link.hash}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-brand-ink/70 transition hover:bg-brand-yellow/40 hover:text-brand-ink"
              activeProps={{ className: "text-brand-ink bg-brand-yellow/30" }}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-brand-ink/70 transition hover:bg-brand-yellow/40"
            >
              My research
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/demo"
            className="rounded-full border-2 border-brand-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            Try the sample
          </Link>

          {!isLoadingAuth && (
            isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-full border-2 border-brand-ink bg-brand-yellow px-4 py-2 text-sm font-bold shadow-pop-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full border-2 border-brand-ink bg-white px-5 py-2 text-sm font-bold shadow-pop-sm transition hover:-translate-y-0.5"
              >
                Login / Sign up
              </Link>
            )
          )}

          <Link
            to="/"
            hash="composer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            Start research
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-brand-ink bg-white shadow-pop-sm md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-brand-ink/10 bg-brand-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={link.hash}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-brand-ink/80 hover:bg-brand-yellow/40"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-semibold"
              >
                My research
              </Link>
            )}

            {!isLoadingAuth && (
              isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-xl border-2 border-brand-ink bg-white px-4 py-3 text-sm font-bold"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl border-2 border-brand-ink bg-white px-4 py-3 text-center text-sm font-bold"
                >
                  Login / Sign up
                </Link>
              )
            )}

            <Link
              to="/"
              hash="composer"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand-ink bg-brand-red px-4 py-3 text-sm font-bold text-white shadow-pop-sm"
            >
              Start research
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
