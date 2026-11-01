/**
 * ShinCheck analysis engine.
 * Deterministic, evidence-first analysis of whatever text the user supplied.
 * It never invents dates or facts: every claim, gap, conflict and freshness
 * warning is derived from the supplied source text.
 */

export const CATEGORIES = [
  { value: "scholarship", label: "Scholarships & grants" },
  { value: "admissions", label: "College admissions" },
  { value: "career", label: "Careers & jobs" },
  { value: "government", label: "Government schemes" },
  { value: "business", label: "Business research" },
  { value: "general", label: "General research" },
];

const STOPWORDS = new Set(
  "a an the and or but if then than that this these those of to in on at for with from by as is are was were be been being it its their his her they we you your our i me my he she them all any each some such can could may might will would should must do does did not no nor so very more most other into over under again further once here there when where why how what which who whom about above after before between both during out off only own same too just don now per also within across while".split(
    /\s+/
  )
);

const SIGNAL =
  /(deadline|last date|apply|application|eligib|required|requirement|must|should|income|fee|salary|percent|%|₹|\$|rs\.?|year|month|before|after|within|approx|cutoff|rank|contact|renew|document|age|limit|criteria|eligible|scholarship|tuition|seat|score)/i;

const UNCERTAIN =
  /(may|might|could|approximately|around|reportedly|likely|expected|unclear|not clear|tbd|to be announced|roughly|believed to)/i;

const DEADLINE =
  /(deadline|last date|closing date|apply by|applications close|due by|submit before|window closes|closes on)/i;

const MONTHS =
  /(january|february|march|april|may|june|july|august|september|october|november|december)/i;

const REGION =
  /(state|district|region|national|rural|urban|india|abroad|province|county|zone|karnataka|kerala|tamil nadu|delhi|maharashtra)/i;

const CYCLIC = /(round|cycle|phase|session|batch|term|semester|year)/i;

const CATEGORY_GAPS = {
  scholarship: [
    {
      title: "Income and eligibility limits",
      why: "Most scholarship rejections come from an income or marks threshold nobody verified.",
      question: "What exact income, marks, age and category limits apply this cycle?",
      next: "Open the official scheme page and copy the eligibility block word for word.",
      priority: "high",
      match: ["income", "eligib", "marks", "percentage", "cutoff", "limit"],
    },
    {
      title: "Closing date for this cycle",
      why: "Without a confirmed deadline, a complete application can still miss the window.",
      question: "What is the confirmed closing date and time for this cycle?",
      next: "Check the official notice, not a third-party summary, for the closing date.",
      priority: "high",
      match: ["deadline", "last date", "closing", "apply by", "window"],
    },
    {
      title: "Renewal and continuation rules",
      why: "A one-year award quietly stops if renewal conditions are missed.",
      question: "What must be maintained to renew the award in the following year?",
      next: "Look for a renewal, continuation or maintenance-of-award section in the guidelines.",
      priority: "high",
      match: ["renew", "continuation", "maintain", "next year", "subsequent"],
    },
    {
      title: "Documents required for verification",
      why: "Missing one certificate at upload time can void an otherwise valid application.",
      question: "Which certificates and proofs must be uploaded, and who attests them?",
      next: "Download the guidelines annexure that lists the document checklist.",
      priority: "medium",
      match: ["document", "certificate", "proof", "affidavit", "bonafide", "upload"],
    },
    {
      title: "Disbursement timeline and support contact",
      why: "Students need to know when money arrives and who to ask when it does not.",
      question: "When is the amount disbursed, and which office handles queries?",
      next: "Find the sanction and disbursement section plus a helpline or nodal officer.",
      priority: "medium",
      match: ["disburse", "payment", "sanction", "helpline", "contact", "nodal"],
    },
  ],
  admissions: [
    {
      title: "Academic eligibility and qualifying exam",
      why: "Applying without the required subject combination or score wastes a cycle.",
      question: "What subjects, marks and entrance scores are required?",
      next: "Read the official admission brochure eligibility table.",
      priority: "high",
      match: ["eligib", "qualif", "subject", "entrance", "cutoff", "rank", "score"],
    },
    {
      title: "Counseling rounds and deadlines",
      why: "Seat allotment depends on round dates, not just the application date.",
      question: "What are the round dates, allotment rules and last date to accept a seat?",
      next: "Check the counseling schedule published by the admitting authority.",
      priority: "high",
      match: ["round", "counsel", "allot", "deadline", "schedule"],
    },
    {
      title: "Fees, deposits and refund policy",
      why: "Refund terms decide how much money is at risk if plans change.",
      question: "What are the full fees, deposit amounts and refund conditions?",
      next: "Locate the official fee circular and refund rules.",
      priority: "high",
      match: ["fee", "tuition", "refund", "deposit", "scholarship"],
    },
    {
      title: "Reservation and quota details",
      why: "Quota rules change cutoffs and the documents you must bring.",
      question: "Which quota applies, and which certificates prove it?",
      next: "Read the reservation section of the prospectus.",
      priority: "medium",
      match: ["reservation", "quota", "category", "certificate"],
    },
    {
      title: "Accreditation and placement evidence",
      why: "Claims about ranking and placement are frequently outdated or promotional.",
      question: "Is the programme accredited, and what do placement reports actually show?",
      next: "Check the accreditation body register and the latest placement report.",
      priority: "medium",
      match: ["accredit", "naac", "ranking", "placement", "approved"],
    },
  ],
  career: [
    {
      title: "Role requirements and experience",
      why: "Requirement mismatch is the fastest rejection reason.",
      question: "Which skills, years of experience and qualifications are mandatory?",
      next: "Read the original job posting on the employer's own careers page.",
      priority: "high",
      match: ["skill", "experience", "qualif", "require", "degree"],
    },
    {
      title: "Compensation and location terms",
      why: "Salary ranges in aggregators are often estimates, not offers.",
      question: "What is the confirmed pay range, work mode and location?",
      next: "Ask the recruiter to confirm compensation and remote policy in writing.",
      priority: "high",
      match: ["salary", "ctc", "compensation", "location", "remote", "stipend"],
    },
    {
      title: "Hiring process and closing date",
      why: "Postings close silently and interview loops vary by team.",
      question: "How many interview stages are there, and when does the posting close?",
      next: "Confirm the process and closing date with the hiring contact.",
      priority: "high",
      match: ["interview", "process", "deadline", "apply", "close"],
    },
    {
      title: "Employer credibility signals",
      why: "Company age, funding and reviews shape stability and contract risk.",
      question: "What evidence supports the employer's claims about size and stability?",
      next: "Cross-check the company register, funding records and employee reviews.",
      priority: "medium",
      match: ["company", "founded", "funding", "review", "revenue"],
    },
    {
      title: "Contract, probation and benefits",
      why: "Notice periods and probation terms are rarely in the posting.",
      question: "What are the probation, notice period and benefits terms?",
      next: "Request the offer terms and benefits summary before accepting.",
      priority: "medium",
      match: ["contract", "probation", "notice", "benefit", "leave"],
    },
  ],
  government: [
    {
      title: "Beneficiary eligibility",
      why: "Scheme pages change criteria between cycles without announcement.",
      question: "Who exactly qualifies, and which exclusions apply?",
      next: "Read the latest gazette or scheme guideline PDF.",
      priority: "high",
      match: ["eligib", "beneficiar", "criteria", "exclusion", "income"],
    },
    {
      title: "Application window and cycle",
      why: "Many schemes open only briefly, once a year.",
      question: "When does the current window open and close?",
      next: "Check the official portal noticeboard for the live window.",
      priority: "high",
      match: ["deadline", "window", "last date", "cycle", "apply"],
    },
    {
      title: "Benefit amount and disbursement",
      why: "Announced amounts and actual transfers often differ.",
      question: "How much is provided, in what instalments, and through which channel?",
      next: "Find the sanction order format and payment schedule.",
      priority: "high",
      match: ["amount", "benefit", "disburse", "instal", "transfer"],
    },
    {
      title: "Required documents and verification",
      why: "Verification failures are the most common rejection cause.",
      question: "Which documents are mandatory, and who verifies them?",
      next: "Download the document checklist from the official portal.",
      priority: "medium",
      match: ["document", "verif", "certificate", "aadhaar", "proof"],
    },
    {
      title: "Nodal office and grievance route",
      why: "Escalation is only possible through a named office.",
      question: "Which office owns the scheme, and how are grievances filed?",
      next: "Note the nodal officer contact and grievance link.",
      priority: "medium",
      match: ["nodal", "office", "grievance", "helpline", "contact"],
    },
  ],
  business: [
    {
      title: "Market size and demand evidence",
      why: "Market numbers in blog posts are frequently recycled and unsourced.",
      question: "What primary data supports the market size and growth claim?",
      next: "Trace the number to a named report, year and methodology.",
      priority: "high",
      match: ["market", "demand", "size", "growth", "billion", "million"],
    },
    {
      title: "Competitor landscape",
      why: "Underestimating incumbents is the most expensive early mistake.",
      question: "Who are the direct competitors, and what do they charge?",
      next: "List five direct competitors with pricing and positioning evidence.",
      priority: "high",
      match: ["competitor", "rival", "player", "landscape", "alternative"],
    },
    {
      title: "Pricing and unit economics",
      why: "Revenue projections collapse if cost per unit is unverified.",
      question: "What does one unit cost to deliver, and at what price?",
      next: "Build a cost sheet from supplier quotes rather than estimates.",
      priority: "high",
      match: ["price", "cost", "margin", "revenue", "unit"],
    },
    {
      title: "Regulation, licences and compliance",
      why: "A missing licence can block launch after spending.",
      question: "Which licences, registrations and taxes apply?",
      next: "Confirm requirements with the relevant licensing authority.",
      priority: "high",
      match: ["licence", "license", "regulation", "compliance", "gst", "permit"],
    },
    {
      title: "Customer segment and channels",
      why: "Channel assumptions drive acquisition cost more than product features.",
      question: "Which segment buys first, and through which channel?",
      next: "Validate the channel with ten real customer conversations.",
      priority: "medium",
      match: ["customer", "segment", "channel", "audience", "distribution"],
    },
  ],
  general: [
    {
      title: "Key facts and definitions",
      why: "Ambiguous terms cause conclusions that cannot be checked.",
      question: "What are the core facts and how are key terms defined?",
      next: "Write one neutral sentence per key term with its source.",
      priority: "high",
      match: ["definition", "means", "refers", "fact", "according"],
    },
    {
      title: "Latest update or timeline",
      why: "Information without a date cannot be trusted as current.",
      question: "When was this information last confirmed or updated?",
      next: "Find the publication or last-updated date on the primary source.",
      priority: "high",
      match: ["updated", "published", "latest", "as of", "date"],
    },
    {
      title: "Authoritative primary source",
      why: "Second-hand summaries drift from the original document.",
      question: "Which primary document or authority states this directly?",
      next: "Replace secondary references with the primary source link.",
      priority: "medium",
      match: ["official", "authority", "primary", "government", "source"],
    },
    {
      title: "Risks, limits and exceptions",
      why: "Missing exceptions turn a true statement into a wrong decision.",
      question: "Which exceptions, limits or conflicting cases apply?",
      next: "Search the source for exclusions and caveats before concluding.",
      priority: "medium",
      match: ["except", "limit", "risk", "caveat", "however"],
    },
    {
      title: "Cost, effort and next action",
      why: "Research is only useful if it ends in a decision someone can take.",
      question: "What does acting on this cost, and who does it next?",
      next: "Convert the finding into one dated action with an owner.",
      priority: "low",
      match: ["cost", "budget", "effort", "next step", "plan"],
    },
  ],
};

function clean(value, max = 20000) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function truncate(value, max) {
  const text = clean(value, max + 40);
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function splitSentences(text) {
  return clean(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 38 && s.length <= 300);
}

function numberTokens(text) {
  return (String(text).match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(/,/g, ""));
}

function yearTokens(text) {
  return String(text).match(/\b(?:19|20)\d{2}\b/g) || [];
}

function keywordSet(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
  );
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function claimScore(sentence) {
  let score = 0;
  if (/\d/.test(sentence)) score += 2;
  if (SIGNAL.test(sentence)) score += 2;
  if (yearTokens(sentence).length) score += 1;
  if (sentence.length > 70) score += 1;
  if (UNCERTAIN.test(sentence)) score -= 1;
  return score;
}

function claimCategory(sentence) {
  const s = sentence.toLowerCase();
  if (/(deadline|last date|close|window|apply by|schedule)/.test(s)) return "deadline";
  if (/(eligib|income|criteria|qualif|age|marks|score|cutoff|rank)/.test(s)) return "eligibility";
  if (/(fee|cost|salary|tuition|amount|payment|stipend|price)/.test(s)) return "cost";
  if (/(document|certificate|proof|upload|annexure)/.test(s)) return "documents";
  if (/(renew|continu|maintain|subsequent)/.test(s)) return "renewal";
  if (/(contact|helpline|office|portal|nodal)/.test(s)) return "contact";
  return "general";
}

function classifyConflict(a, b, shared) {
  const yearsA = yearTokens(a.statement);
  const yearsB = yearTokens(b.statement);
  const disjointYears = yearsA.length && yearsB.length && yearsA.every((y) => !yearsB.includes(y));
  if (disjointYears) return "date";
  if (CYCLIC.test(`${a.statement} ${b.statement}`)) return "cycle";
  if (REGION.test(a.statement) || REGION.test(b.statement)) return "region";
  if (shared.some((w) => /categor|quota|reservation|type|kind/.test(w))) return "category";
  return "genuine";
}

const TYPE_NOTE = {
  genuine:
    "Both sources describe the same thing differently, and neither explains why. Treat this as an unresolved contradiction until a primary source settles it.",
  date:
    "The difference looks driven by publication dates or competing cycles rather than a true contradiction. Confirm which cycle you are applying in.",
  cycle:
    "The two claims may refer to different rounds, phases or sessions. Check which cycle each sentence belongs to before acting.",
  region:
    "The sources may cover different regions or jurisdictions, which can legitimately produce different rules.",
  category:
    "The sources may be describing different categories, quotas or product tiers, so the rules can differ without conflicting.",
};

function buildConflicts(claims) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < claims.length; i += 1) {
    for (let j = i + 1; j < claims.length; j += 1) {
      const a = claims[i];
      const b = claims[j];
      if (!a.source_title || a.source_title === b.source_title) continue;
      const ka = keywordSet(a.statement);
      const kb = keywordSet(b.statement);
      const shared = [...ka].filter((w) => kb.has(w));
      if (shared.length < 3) continue;
      const na = new Set(numberTokens(a.statement));
      const nb = new Set(numberTokens(b.statement));
      const onlyA = [...na].filter((n) => !nb.has(n));
      const onlyB = [...nb].filter((n) => !na.has(n));
      if (!onlyA.length || !onlyB.length) continue;
      const type = classifyConflict(a, b, shared);
      const topicKey = shared.slice(0, 3).sort().join("-");
      if (seen.has(topicKey)) continue;
      seen.add(topicKey);
      out.push({
        topic: shared.slice(0, 3).join(" · "),
        claim_a: truncate(a.statement, 240),
        source_a: a.source_title,
        url_a: a.source_url || "",
        date_a: a.source_date || "",
        excerpt_a: truncate(a.excerpt || a.statement, 260),
        claim_b: truncate(b.statement, 240),
        source_b: b.source_title,
        url_b: b.source_url || "",
        date_b: b.source_date || "",
        excerpt_b: truncate(b.excerpt || b.statement, 260),
        explanation: `Both sources discuss ${shared.slice(0, 3).join(", ")} but give different values (${onlyA
          .slice(0, 2)
          .join(" / ")} versus ${onlyB.slice(0, 2).join(" / ")}). ${TYPE_NOTE[type]}`,
        conflict_type: type,
        severity: type === "genuine" ? "high" : type === "date" || type === "cycle" ? "medium" : "low",
      });
      if (out.length >= 6) return out;
    }
  }
  return out;
}

function buildFreshness(sources) {
  const out = [];
  const currentYear = new Date().getFullYear();
  sources.forEach((source) => {
    const text = clean(source.text, 20000);
    const yearsFound = [...yearTokens(source.published_date), ...yearTokens(text)];
    const latestYear = yearsFound.length
      ? Math.max(...yearsFound.map((y) => Number.parseInt(y, 10)))
      : null;

    if (latestYear && latestYear < currentYear - 1) {
      out.push({
        source_title: source.title,
        source_url: source.url || "",
        published_date: source.published_date || "",
        reason: "Refers to an earlier cycle",
        detail: `This source refers to ${latestYear}. Rules, amounts and dates for the current cycle may differ, so treat every figure from it as unverified until you check a newer page.`,
        severity: "high",
      });
      return;
    }

    if (!source.published_date) {
      out.push({
        source_title: source.title,
        source_url: source.url || "",
        published_date: "",
        reason: "Publication date unavailable",
        detail:
          "We could not confirm when this page was published or last updated. Any deadline or amount taken from it should be re-checked on the primary source.",
        severity: "low",
      });
      return;
    }

    const deadlineSentence = splitSentences(text).find((s) => DEADLINE.test(s) && MONTHS.test(s));
    if (deadlineSentence) {
      const dayMonth = deadlineSentence.match(
        /\b(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december)/i
      );
      if (dayMonth) {
        const monthIndex = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ].indexOf(dayMonth[2].toLowerCase());
        const year = Number.parseInt(
          yearTokens(deadlineSentence)[0] || source.published_date.slice(0, 4) || currentYear,
          10
        );
        const deadline = new Date(Date.UTC(year, monthIndex, Number.parseInt(dayMonth[1], 10)));
        if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) {
          out.push({
            source_title: source.title,
            source_url: source.url || "",
            published_date: source.published_date || "",
            reason: "Deadline may already have passed",
            detail: `This source states a deadline of ${dayMonth[1]} ${dayMonth[2]} ${year}, which is in the past. Confirm whether a new window has opened before relying on it.`,
            severity: "high",
          });
        }
      }
    }
  });
  return out.slice(0, 6);
}

function buildGaps({ category, allText, conflicts, sources }) {
  const templates = CATEGORY_GAPS[category] || CATEGORY_GAPS.general;
  const covered = templates.filter((t) => t.match.some((k) => allText.includes(k)));
  const missing = templates.filter((t) => !t.match.some((k) => allText.includes(k)));

  const gaps = missing.map((t, index) => ({
    title: t.title,
    why_it_matters: t.why,
    question: t.question,
    next_step: t.next,
    priority: t.priority,
    order: index,
    status: "open",
  }));

  if (covered.length === templates.length) {
    gaps.push({
      title: "Cross-check the confirmed figures",
      why_it_matters:
        "Every topic in the playbook appears, but appearance is not proof. Figures still need one primary-source confirmation.",
      question: "Which figures come from a primary source rather than a summary?",
      next_step: "Open each cited page and confirm the number directly before using it.",
      priority: "medium",
      order: gaps.length,
      status: "open",
    });
  }

  if (conflicts.length) {
    gaps.push({
      title: "Settle the unresolved contradiction",
      why_it_matters: "Two sources disagree, so at least one of them is wrong for your situation.",
      question: `Which source is authoritative on ${conflicts[0].topic}?`,
      next_step: "Open both cited pages, compare their dates, and note which one is official.",
      priority: "high",
      order: gaps.length,
      status: "open",
    });
  }

  if (!sources.length) {
    gaps.unshift({
      title: "No sources attached yet",
      why_it_matters: "Without a source, every conclusion is an assumption.",
      question: "Which official page or document should answer this first?",
      next_step: "Add one official URL or upload the guideline PDF, then run the analysis again.",
      priority: "high",
      order: 0,
      status: "open",
    });
  }

  return gaps.slice(0, 7).map((gap, index) => ({ ...gap, order: index }));
}

function buildChecklist(gaps, conflicts, freshness) {
  const items = [];
  gaps.slice(0, 5).forEach((gap) => {
    items.push({
      title: `Verify: ${gap.title}`,
      description: gap.question,
      priority: gap.priority,
      status: "todo",
      notes: "",
      recommended_url: "",
      recommended_label: "Open research sources",
      order: items.length,
    });
  });
  conflicts.slice(0, 2).forEach((conflict) => {
    items.push({
      title: `Resolve conflict: ${conflict.topic}`,
      description: conflict.explanation,
      priority: conflict.severity,
      status: "todo",
      notes: "",
      recommended_url: conflict.url_a || conflict.url_b || "",
      recommended_label: conflict.url_a ? "Open first source" : "Open second source",
      order: items.length,
    });
  });
  freshness.slice(0, 2).forEach((warning) => {
    items.push({
      title: `Re-check freshness: ${warning.source_title}`,
      description: warning.detail,
      priority: warning.severity === "high" ? "high" : "medium",
      status: "todo",
      notes: "",
      recommended_url: warning.source_url || "",
      recommended_label: "Open source",
      order: items.length,
    });
  });
  return items.slice(0, 9).map((item, index) => ({ ...item, order: index }));
}

export function runEngineAnalysis({ query, category = "general", sources = [] }) {
  const usable = sources
    .map((s) => ({
      title: clean(s.title) || hostOf(s.url) || "Untitled source",
      url: clean(s.url, 900),
      text: clean(s.text),
      published_date: clean(s.published_date, 40),
      kind: s.kind || "link",
    }))
    .filter((s) => s.text.length > 0);

  const rawClaims = [];
  usable.forEach((source) => {
    const picked = splitSentences(source.text)
      .map((sentence) => ({ sentence, score: claimScore(sentence) }))
      .filter((item) => item.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    picked.forEach(({ sentence, score }) => {
      rawClaims.push({
        statement: truncate(sentence, 250),
        category: claimCategory(sentence),
        status: UNCERTAIN.test(sentence)
          ? "uncertain"
          : /\d/.test(sentence)
            ? "supported"
            : "info",
        confidence: Math.min(94, 48 + score * 9),
        source_title: source.title,
        source_url: source.url,
        source_date: source.published_date,
        excerpt: truncate(sentence, 280),
      });
    });
  });

  const seen = new Set();
  const claims = rawClaims
    .filter((c) => {
      const key = c.statement.toLowerCase().slice(0, 90);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 26);

  const conflicts = buildConflicts(claims);
  const conflictUrls = new Set();
  conflicts.forEach((c) => {
    if (c.url_a) conflictUrls.add(`${c.url_a}|${c.claim_a}`);
    if (c.url_b) conflictUrls.add(`${c.url_b}|${c.claim_b}`);
  });
  claims.forEach((claim) => {
    if (conflictUrls.has(`${claim.source_url}|${claim.statement}`)) claim.status = "conflict";
  });

  const allText = clean(
    [query, ...usable.map((s) => s.text), ...claims.map((c) => c.statement)].join(" ").toLowerCase(),
    60000
  );
  const gaps = buildGaps({ category, allText, conflicts, sources: usable });
  const freshness = buildFreshness(usable);
  const checklist = buildChecklist(gaps, conflicts, freshness);

  const supported = claims.filter((c) => c.status === "supported").length;
  const coverage = claims.length ? Math.round((supported / claims.length) * 100) : 0;

  const sourceDocs = usable.map((source) => {
    const hasConflict = conflicts.some((c) => c.url_a === source.url || c.url_b === source.url);
    return {
      project_id: "",
      title: source.title,
      url: source.url,
      host: hostOf(source.url),
      kind: source.kind,
      published_date: source.published_date,
      excerpt: truncate(source.text, 240),
      word_count: source.text.split(/\s+/).filter(Boolean).length,
      status: hasConflict ? "conflict" : source.published_date ? "supported" : "uncertain",
    };
  });

  const bits = [];
  if (usable.length) bits.push(`${usable.length} source${usable.length === 1 ? "" : "s"} read`);
  if (claims.length)
    bits.push(
      `${claims.length} claim${claims.length === 1 ? "" : "s"} extracted (${supported} backed by a number or date)`
    );
  if (conflicts.length) bits.push(`${conflicts.length} possible conflict${conflicts.length === 1 ? "" : "s"}`);
  if (gaps.length) bits.push(`${gaps.length} topic${gaps.length === 1 ? "" : "s"} still unanswered`);
  if (freshness.length) bits.push(`${freshness.length} freshness warning${freshness.length === 1 ? "" : "s"}`);

  let summary = `Research brief: “${truncate(query, 130)}”.`;
  summary += bits.length ? ` ${bits.join(", ")}.` : "";
  summary += usable.length
    ? " Every claim below is traceable to the text you supplied — open the source before acting on it."
    : " No sources were supplied yet, so this is a verification plan: the gaps and checklist below show what to confirm first.";

  return {
    summary,
    coverage,
    claims,
    gaps,
    conflicts,
    freshness,
    checklist,
    sources: sourceDocs,
    engine: usable.length ? "ShinCheck engine" : "Research plan",
  };
}