import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Link2, FileText, ArrowRight, Loader2, Search, Wand2 } from "lucide-react";
import { createResearchProject } from "@/lib/research-fns";
import { useAuth } from "@/lib/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ComposerProgress from "@/components/landing/ComposerProgress";
import DocumentAttach from "@/components/landing/DocumentAttach";

const MODES = [
  { id: "scratch", label: "Start from Scratch", icon: Sparkles },
  { id: "links", label: "Start from Website Links", icon: Link2 },
  { id: "documents", label: "Start from Documents", icon: FileText },
];

const CATEGORIES = [
  { value: "scholarship", label: "Scholarships" },
  { value: "admissions", label: "College admissions" },
  { value: "career", label: "Careers & jobs" },
  { value: "government", label: "Government schemes" },
  { value: "business", label: "Business" },
  { value: "general", label: "Anything else" },
];

const EXAMPLES = [
  { text: "Which scholarships can a first-year engineering student apply for this year?", category: "scholarship" },
  { text: "Compare tuition and hostel fees for three MBA colleges in Pune", category: "admissions" },
  { text: "Is data analytics still a growing career for freshers in 2026?", category: "career" },
  { text: "What documents are required for a farmer income support scheme?", category: "government" },
  { text: "How big is the EV charging market for a small business to enter?", category: "business" },
];

function parseUrls(value) {
  return value
    .split(/[\s,]+/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\/\S+\.\S+/.test(url))
    .slice(0, 8);
}

export default function ResearchComposer() {
  const navigate = useNavigate();
  const createProject = useServerFn(createResearchProject);
  const { isAuthenticated } = useAuth();

  const [mode, setMode] = useState("scratch");
  const [query, setQuery] = useState("");
  const [urls, setUrls] = useState("");
  const [notes, setNotes] = useState("");
  const [docs, setDocs] = useState([]);
  const [category, setCategory] = useState("scholarship");
  const [webSearch, setWebSearch] = useState(false);
  const [deepAi, setDeepAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");

  const readyDocs = docs.filter((doc) => doc.status === "ready" && doc.text);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shincheck.pending_research");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.query) setQuery(parsed.query);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.urls) setUrls(parsed.urls);
        if (parsed.notes) setNotes(parsed.notes);
        if (typeof parsed.webSearch === "boolean") setWebSearch(parsed.webSearch);
        if (typeof parsed.deepAi === "boolean") setDeepAi(parsed.deepAi);
        sessionStorage.removeItem("shincheck.pending_research");
      }
    } catch {
      // ignore
    }
  }, []);

  const submit = async () => {
    setError("");
    if (query.trim().length < 6) {
      setError("Tell ShinCheck what you want to research first.");
      return;
    }
    const linkList = parseUrls(urls);
    if (mode === "links" && !linkList.length) {
      setError("Add at least one full link, starting with https://");
      return;
    }
    if (docs.some((doc) => doc.status === "reading")) {
      setError("Give the PDFs a moment to finish reading, then try again.");
      return;
    }
    if (mode === "documents" && !readyDocs.length) {
      setError("Attach at least one readable PDF, or switch to Start from Scratch.");
      return;
    }

    setBusy(true);
    setStage(0);
    try {
      const sources = [];

      readyDocs.forEach((doc) =>
        sources.push({
          title: doc.title || doc.name,
          text: doc.text,
          kind: "document",
          published_date: doc.published_date || "",
        })
      );

      linkList.forEach((url) => sources.push({ url, kind: "link" }));

      if (mode === "scratch" && notes.trim().length > 40) {
        sources.push({ title: "Pasted notes", text: notes.trim(), kind: "text" });
      }

      setStage(1);
      const result = await createProject({
        data: {
          query: query.trim(),
          category,
          input_mode: mode,
          web_search: webSearch,
          deep_ai: deepAi,
          owner_key: "",
          sources,
        },
      });

      setStage(2);
      await navigate({ to: "/project/$projectId", params: { projectId: result.projectId } });
    } catch (err) {
      setError(err?.message || "Something went wrong while analysing. Please try again.");
      setBusy(false);
      setStage(0);
    }
  };

  return (
    <section id="composer" className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-5 pb-16 sm:px-8">
      <div className="pop-card overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b-2 border-brand-ink/10 bg-brand-cream px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-brand-ink bg-brand-red" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-brand-ink bg-brand-yellow" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-brand-ink bg-brand-green" />
            <span className="ml-2 text-xs font-bold uppercase tracking-wider text-brand-ink/45">
              New research
            </span>
          </div>
          <span className="hidden text-[11px] font-semibold text-brand-ink/40 sm:block">
            Demo mode runs without any paid AI calls
          </span>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-pressed={mode === item.id}
                className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-[13px] font-bold transition ${
                  mode === item.id
                    ? "border-brand-ink bg-brand-yellow text-brand-ink shadow-pop-sm"
                    : "border-brand-ink/15 bg-white text-brand-ink/60 hover:border-brand-ink/40 hover:text-brand-ink"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>

          <textarea
            id="research-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={3}
            placeholder="What do you want to research today?"
            className="field-input mt-4 resize-none text-[17px] leading-relaxed sm:text-lg"
          />

          {mode === "scratch" && (
            <div className="mt-3">
              <label htmlFor="notes-input" className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">
                Optional — paste anything you already have
              </label>
              <textarea
                id="notes-input"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Paste notes, a scheme paragraph, or terms you want checked…"
                className="field-input mt-1.5 resize-none text-sm"
              />
            </div>
          )}

          {mode === "links" && (
            <div className="mt-3">
              <label htmlFor="url-input" className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">
                Website links — one per line, up to 8
              </label>
              <textarea
                id="url-input"
                value={urls}
                onChange={(event) => setUrls(event.target.value)}
                rows={4}
                placeholder={"https://scholarships.gov.in/\nhttps://example.edu.in/notices/scholarship-2026"}
                className="field-input mt-1.5 resize-none font-mono text-[13px]"
              />
              <p className="mt-1.5 text-xs text-brand-ink/45">
                {parseUrls(urls).length} valid link{parseUrls(urls).length === 1 ? "" : "s"} detected. Pages
                that block automated reading are kept as a source but marked unreadable.
              </p>
            </div>
          )}

          <DocumentAttach docs={docs} setDocs={setDocs} />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">
                Research category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5 h-11 rounded-xl border-2 border-brand-ink/20 bg-white text-sm font-semibold">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5 rounded-xl bg-brand-cream px-3.5 py-3">
              <label className="flex cursor-pointer items-start justify-between gap-3">
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Search className="h-3.5 w-3.5 text-brand-blue" />
                    Include live web search
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-brand-ink/45">
                    Searches the web for fresh sources (needs AI analysis on).
                  </span>
                </span>
                <Switch checked={webSearch} onCheckedChange={setWebSearch} aria-label="Include live web search" />
              </label>
              <label className="flex cursor-pointer items-start justify-between gap-3 border-t border-brand-ink/10 pt-2.5">
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-bold">
                    <Wand2 className="h-3.5 w-3.5 text-brand-red" />
                    Deep AI analysis
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-brand-ink/45">
                    Off = built-in analysis with no paid calls.
                  </span>
                </span>
                <Switch checked={deepAi} onCheckedChange={setDeepAi} aria-label="Use deep AI analysis" />
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border-2 border-brand-red/40 bg-brand-red/5 px-3 py-2 text-sm font-semibold text-brand-red">
              {error}
            </p>
          )}

          <button
            type="button"
            id="analyze-submit"
            onClick={submit}
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-ink bg-brand-red px-6 py-4 font-display text-lg font-extrabold text-white shadow-pop transition hover:-translate-y-0.5 hover:shadow-pop-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {busy ? "Analysing…" : "Analyze My Research"}
            {!busy && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-ink/40">Try one:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example.text}
            type="button"
            onClick={() => {
              setQuery(example.text);
              setCategory(example.category);
              document.getElementById("research-input")?.focus({ preventScroll: true });
            }}
            className="rounded-full border-2 border-brand-ink/15 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink/65 transition hover:border-brand-ink hover:bg-brand-yellow/40 hover:text-brand-ink"
          >
            {example.text.length > 54 ? `${example.text.slice(0, 54)}…` : example.text}
          </button>
        ))}
      </div>

      {busy && <ComposerProgress stage={stage} />}
    </section>
  );
}