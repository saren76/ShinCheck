import { motion, useReducedMotion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { ScanLine, GitCompare, HelpCircle, Check } from "lucide-react";

// Mascot image — replace this URL with your own CDN or Supabase Storage URL
// Mascot illustration stored locally in public/mascot.png
const MASCOT =
  "/mascot.png";

const CARDS = [
  {
    id: "scan",
    icon: ScanLine,
    tone: "bg-brand-blue-soft text-brand-blue",
    title: "Source scanned",
    body: "Official notice · 1,240 words",
    position: "left-0 top-[10%]",
    delay: 0,
    drift: 9,
  },
  {
    id: "conflict",
    icon: GitCompare,
    tone: "bg-brand-red/10 text-brand-red",
    title: "2 sources disagree",
    body: "Deadline: 31 Mar vs 15 Apr",
    position: "right-0 top-[33%]",
    delay: 1.1,
    drift: 7,
  },
  {
    id: "gap",
    icon: HelpCircle,
    tone: "bg-brand-yellow/45 text-brand-ink",
    title: "Missing detail",
    body: "Income limit not stated",
    position: "bottom-[17%] left-0",
    delay: 2,
    drift: 11,
  },
  {
    id: "verified",
    icon: Check,
    tone: "bg-brand-green/12 text-brand-green",
    title: "Verified",
    body: "Traced to source excerpt",
    position: "bottom-[4%] right-0",
    delay: 1.5,
    drift: 8,
  },
];

const PARTICLES = [
  { left: "10%", top: "22%", size: "h-2 w-2", tone: "bg-brand-yellow", delay: 0 },
  { left: "86%", top: "16%", size: "h-1.5 w-1.5", tone: "bg-brand-red", delay: 0.9 },
  { left: "18%", top: "64%", size: "h-1.5 w-1.5", tone: "bg-brand-blue", delay: 1.6 },
  { left: "78%", top: "58%", size: "h-2 w-2", tone: "bg-brand-yellow", delay: 2.3 },
  { left: "50%", top: "6%", size: "h-1.5 w-1.5", tone: "bg-brand-green", delay: 1.2 },
  { left: "92%", top: "78%", size: "h-2 w-2", tone: "bg-brand-blue", delay: 2.8 },
  { left: "6%", top: "44%", size: "h-1.5 w-1.5", tone: "bg-brand-red", delay: 3.1 },
];

const MASK = {
  maskImage: "radial-gradient(circle at 50% 48%, #000 60%, transparent 86%)",
  WebkitMaskImage: "radial-gradient(circle at 50% 48%, #000 60%, transparent 86%)",
};

export default function HeroMascotStage() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-8 bottom-6 rounded-[45%] bg-brand-yellow/35 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand-ink/12"
      />

      <motion.div
        animate={reduce ? undefined : { y: [0, -16, 0], rotate: [-1.6, 1.6, -1.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 bg-brand-cream"
      >
        <Image
          src={MASCOT}
          alt="ShinCheck's cartoon detective mascot peering through a magnifying glass"
          fittingType="fit"
          className="mx-auto h-[300px] w-full object-contain mix-blend-multiply drop-shadow-[0_26px_34px_rgba(27,29,34,0.18)] sm:h-[400px] lg:h-[500px]"
          style={MASK}
        />
      </motion.div>

      {CARDS.map((card) => (
        <motion.div
          key={card.id}
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: card.drift, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
          className={`absolute z-20 hidden w-[184px] rounded-2xl border-2 border-brand-ink bg-white/95 p-2.5 shadow-pop-sm backdrop-blur-sm sm:block ${card.position}`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg border border-brand-ink/15 ${card.tone}`}>
              <card.icon className="h-3 w-3" />
            </span>
            <p className="truncate text-[11px] font-extrabold leading-none">{card.title}</p>
          </div>
          <p className="mt-1.5 truncate text-[10px] font-semibold text-brand-ink/50">{card.body}</p>
        </motion.div>
      ))}

      <motion.span
        animate={reduce ? undefined : { y: [0, -12, 0], opacity: [0.45, 0.9, 0.45] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
        className="absolute left-[42%] top-[-4%] hidden font-display text-3xl font-extrabold text-brand-red/70 sm:block"
      >
        ?
      </motion.span>
      <motion.span
        animate={reduce ? undefined : { y: [0, 10, 0], opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        aria-hidden="true"
        className="absolute right-[16%] top-[8%] hidden font-display text-2xl font-extrabold text-brand-blue/60 sm:block"
      >
        ?
      </motion.span>

      {PARTICLES.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          animate={reduce ? undefined : { y: [0, -14, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 6 + particle.delay, repeat: Infinity, ease: "easeInOut", delay: particle.delay }}
          aria-hidden="true"
          className={`absolute rounded-full ${particle.size} ${particle.tone}`}
          style={{ left: particle.left, top: particle.top }}
        />
      ))}

      <div className="absolute inset-x-0 -bottom-2 z-20 flex justify-center sm:-bottom-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-pop-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-green" />
          </span>
          Scanning sources
        </span>
      </div>
    </div>
  );
}