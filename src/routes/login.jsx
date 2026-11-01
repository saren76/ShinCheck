
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { serverSignUp } from "@/lib/research-fns";
import { Loader2, LockKeyhole, Mail, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : "/dashboard",
  }),
  component: LoginPage,
});

function LoginPage() {
  const { returnTo } = Route.useSearch();
  const callServerSignUp = useServerFn(serverSignUp);

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function getSafeReturnPath() {
    try {
      const url = new URL(returnTo, window.location.origin);
      if (url.origin !== window.location.origin) return "/dashboard";
      return url.pathname + url.search + url.hash;
    } catch {
      return "/dashboard";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        let autoConfirmed = false;
        try {
          const res = await callServerSignUp({ data: { email: email.trim(), password } });
          autoConfirmed = Boolean(res?.autoConfirmed);
        } catch {
          // fallback to client-side signup
        }

        if (autoConfirmed) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInErr) throw signInErr;
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

          if (error) throw error;

          if (!data.session) {
            setMessage("Account created! Please check your email to confirm your account, then log in.");
            setMode("login");
            return;
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      }

      window.location.assign(getSafeReturnPath());
    } catch (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("rate limit")) {
        setError(
          "Supabase email rate limit reached (free tier allows max 3 confirmation emails/hour). If you already created your account, click 'Log in' above to sign in directly. To disable this limit, turn off 'Confirm email' in Supabase Dashboard → Auth → Providers → Email."
        );
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-lg items-center justify-center px-5 py-12">
      <div className="pop-card w-full p-7 sm:p-10">
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border-2 border-brand-ink bg-brand-yellow">
            <Sparkles className="h-7 w-7" />
          </span>

          <h1 className="mt-4 font-display text-3xl font-extrabold">
            {mode === "login" ? "Welcome back!" : "Join ShinCheck!"}
          </h1>

          <p className="mt-2 text-sm text-brand-ink/60">
            {mode === "login"
              ? "Log in to continue your research journey."
              : "Create an account to save and manage your research."}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-full border-2 border-brand-ink bg-brand-cream p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
            className={`rounded-full py-2 text-sm font-bold ${
              mode === "login" ? "bg-brand-red text-white" : "text-brand-ink"
            }`}
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setMessage("");
            }}
            className={`rounded-full py-2 text-sm font-bold ${
              mode === "signup" ? "bg-brand-red text-white" : "text-brand-ink"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold">
              Email address
            </label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-brand-ink bg-white px-3">
              <Mail className="h-4 w-4 text-brand-ink/50" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-brand-ink bg-white px-3">
              <LockKeyhole className="h-4 w-4 text-brand-ink/50" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl bg-green-100 p-3 text-sm font-semibold text-green-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-ink bg-brand-red px-5 py-3 font-bold text-white shadow-pop-sm transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Log in to ShinCheck" : "Create my account"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t-2 border-brand-ink/10 pt-4 text-center">
          <p className="text-xs text-brand-ink/60">Want to test ShinCheck right now?</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/demo"
              className="rounded-full border border-brand-ink/20 bg-brand-cream px-3 py-1 text-xs font-bold text-brand-ink hover:bg-brand-yellow/30"
            >
              Try sample analysis
            </Link>
            <Link
              to="/"
              hash="composer"
              className="rounded-full border border-brand-ink/20 bg-brand-cream px-3 py-1 text-xs font-bold text-brand-ink hover:bg-brand-yellow/30"
            >
              Run instant research
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-brand-ink/60">
          <Link to="/" className="font-bold text-brand-red hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
