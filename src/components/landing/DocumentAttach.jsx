import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, FileText, Loader2, RotateCw, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { analyzeDocument } from "@/lib/research-fns";

const MAX_DOCS = 4;
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * DocumentAttach — uploads a PDF to Supabase Storage and calls the server-side
 * analyzeDocument function, which currently returns an explanatory error asking
 * the user to paste text. When OPENAI_API_KEY is configured the server function
 * can be upgraded to call a PDF-parsing edge function or similar.
 *
 * The upload step stores the file privately under the authenticated user's folder
 * so it can be retrieved later (e.g. by a future server-side extraction step).
 */
export default function DocumentAttach({ docs, setDocs }) {
  const readDocument = useServerFn(analyzeDocument);
  const fileRef = useRef(null);
  const [error, setError] = useState("");

  const readFile = async (entry) => {
    setDocs((prev) =>
      prev.map((doc) => (doc.id === entry.id ? { ...doc, status: "reading", reason: "" } : doc))
    );
    try {
      // Upload to Supabase Storage (private bucket "documents").
      // The bucket must be created in the Supabase dashboard with private access.
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || "anon";
      const path = `${userId}/${Date.now()}-${entry.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, entry.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf",
        });

      // If upload fails (e.g. bucket not configured), fall through to server fn
      // with an empty fileUri so it can return the graceful error message.
      const fileUri = uploadData?.path || "";

      const parsed = await readDocument({ data: { fileUri, fileName: entry.name } });
      setDocs((prev) =>
        prev.map((doc) => {
          if (doc.id !== entry.id) return doc;
          if (parsed.ok && parsed.text) {
            return {
              ...doc,
              status: "ready",
              text: parsed.text,
              title: parsed.title || doc.name,
              published_date: parsed.published_date || "",
              reason: "",
            };
          }
          return {
            ...doc,
            status: "failed",
            reason: parsed.reason || "No readable text was found in this PDF.",
          };
        })
      );
    } catch (err) {
      setDocs((prev) =>
        prev.map((doc) =>
          doc.id === entry.id
            ? { ...doc, status: "failed", reason: err?.message || "That file could not be uploaded." }
            : doc
        )
      );
    }
  };

  const addFiles = (incoming) => {
    setError("");
    const accepted = [];
    Array.from(incoming || []).forEach((file) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        setError("Only PDF documents can be read right now.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is larger than 12 MB.`);
        return;
      }
      if (docs.some((doc) => doc.name === file.name && doc.size === file.size)) return;
      accepted.push(file);
    });

    const room = Math.max(0, MAX_DOCS - docs.length);
    if (accepted.length > room) setError(`You can attach up to ${MAX_DOCS} PDFs at a time.`);

    const entries = accepted.slice(0, room).map((file, index) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file,
      status: "reading",
      text: "",
      title: "",
      published_date: "",
      reason: "",
    }));
    if (!entries.length) return;
    setDocs((prev) => [...prev, ...entries]);
    entries.forEach(readFile);
  };

  const readyCount = docs.filter((doc) => doc.status === "ready").length;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">
          PDF documents — optional, up to 4
        </span>
        {docs.length > 0 && (
          <span className="text-[11px] font-semibold text-brand-ink/40">
            {readyCount}/{docs.length} read
          </span>
        )}
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className="mt-1.5 rounded-2xl border-2 border-dashed border-brand-ink/25 bg-brand-cream/60 px-4 py-3"
      >
        <input
          ref={fileRef}
          id="pdf-input"
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-white px-4 py-2 text-sm font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            <Upload className="h-4 w-4" />
            Attach PDFs
          </button>
          <p className="text-xs text-brand-ink/50">or drop them here · 12 MB each · stored privately</p>
        </div>

        {docs.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-2 rounded-xl border-2 border-brand-ink/10 bg-white px-3 py-2 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-brand-red" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{doc.name}</span>
                  {doc.status === "ready" && (
                    <span className="block text-[11px] font-semibold text-brand-green">
                      Read · {doc.text.split(/\s+/).filter(Boolean).length} words ready to analyse
                    </span>
                  )}
                  {doc.status === "failed" && (
                    <span className="block text-[11px] font-semibold text-brand-red">{doc.reason}</span>
                  )}
                </span>

                {doc.status === "reading" && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-brand-ink/45">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Reading
                  </span>
                )}
                {doc.status === "ready" && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-green" aria-label="Read" />
                )}
                {doc.status === "failed" && (
                  <>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-brand-red" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => readFile(doc)}
                      aria-label={`Try reading ${doc.name} again`}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-brand-cream"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}

                <span className="shrink-0 text-xs text-brand-ink/40">
                  {(doc.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${doc.name}`}
                  onClick={() => setDocs((prev) => prev.filter((item) => item.id !== doc.id))}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full hover:bg-brand-cream"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs font-semibold text-brand-red">{error}</p>}
    </div>
  );
}