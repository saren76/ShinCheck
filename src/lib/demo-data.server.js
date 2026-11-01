/**
 * Clearly-labelled simulated sample: a scholarship research walkthrough.
 * Nothing here is fetched live — it exists so visitors can explore the
 * workspace without spending credits or uploading their own data.
 */

export const DEMO_PROJECT = {
  title: "Sample analysis — National Merit Scholarship 2026",
  query: "Eligibility, deadlines and renewal rules for the National Merit Scholarship 2026",
  category: "scholarship",
  input_mode: "links",
  status: "ready",
  analysis_engine: "Simulated demonstration",
  is_demo: true,
  web_search: false,
  owner_key: "demo",
  summary:
    "Simulated walkthrough of four sources about the National Merit Scholarship. Eligibility rules are stated consistently and back each other up, but the closing date differs between two official-looking pages, renewal requirements are never described, and one source clearly belongs to an earlier cycle. Every figure below is sample content created to demonstrate the workspace — not a real scholarship outcome.",
  coverage: 57,
  source_count: 4,
  claim_count: 8,
  gap_count: 4,
  conflict_count: 2,
  freshness_count: 3,
  checklist_total: 6,
  checklist_done: 1,
};

export const DEMO_SOURCES = [
  {
    title: "National Scholarship Portal — eligibility page",
    url: "https://scholarships.gov.in/",
    host: "scholarships.gov.in",
    kind: "link",
    published_date: "2025-08-12",
    excerpt:
      "Applicants must have scored at least 60% in the qualifying examination and come from a family with an annual income below ₹2,50,000. The scheme covers tuition fees up to ₹20,000 per year.",
    word_count: 640,
    status: "conflict",
  },
  {
    title: "State Higher Education Department notice",
    url: "https://example.edu.in/notices/merit-scholarship-2026",
    host: "example.edu.in",
    kind: "link",
    published_date: "2026-02-04",
    excerpt:
      "The application window for the 2026 cycle closes on 31 October 2026. Late submissions will not be accepted and incomplete document sets will be rejected without review.",
    word_count: 410,
    status: "conflict",
  },
  {
    title: "College financial aid office FAQ",
    url: "https://example-college.edu.in/aid/faq",
    host: "example-college.edu.in",
    kind: "link",
    published_date: "2026-03-18",
    excerpt:
      "Applications for the 2026 cycle close on 15 November 2026. Students enrolled in government-recognised institutions can apply; renewal applicants are assessed separately.",
    word_count: 520,
    status: "conflict",
  },
  {
    title: "Student forum thread on scholarship payouts",
    url: "https://forum.example.org/threads/merit-payouts",
    host: "forum.example.org",
    kind: "link",
    published_date: "",
    excerpt:
      "Several students report that disbursement usually happens within 90 days of verification, though the portal reportedly stopped accepting new uploads in September.",
    word_count: 300,
    status: "uncertain",
  },
];

export const DEMO_CLAIMS = [
  {
    statement:
      "Applicants must have scored at least 60% in the qualifying examination with an annual family income below ₹2,50,000.",
    category: "eligibility",
    status: "supported",
    confidence: 88,
    source_title: "National Scholarship Portal — eligibility page",
    source_url: "https://scholarships.gov.in/",
    source_date: "2025-08-12",
    excerpt:
      "Applicants must have scored at least 60% in the qualifying examination and come from a family with an annual income below ₹2,50,000.",
  },
  {
    statement: "The scheme covers tuition fees up to ₹20,000 per year.",
    category: "cost",
    status: "supported",
    confidence: 84,
    source_title: "National Scholarship Portal — eligibility page",
    source_url: "https://scholarships.gov.in/",
    source_date: "2025-08-12",
    excerpt: "The scheme covers tuition fees up to ₹20,000 per year.",
  },
  {
    statement: "The application window for the 2026 cycle closes on 31 October 2026.",
    category: "deadline",
    status: "conflict",
    confidence: 79,
    source_title: "State Higher Education Department notice",
    source_url: "https://example.edu.in/notices/merit-scholarship-2026",
    source_date: "2026-02-04",
    excerpt: "The application window for the 2026 cycle closes on 31 October 2026.",
  },
  {
    statement: "Applications for the 2026 cycle close on 15 November 2026.",
    category: "deadline",
    status: "conflict",
    confidence: 74,
    source_title: "College financial aid office FAQ",
    source_url: "https://example-college.edu.in/aid/faq",
    source_date: "2026-03-18",
    excerpt: "Applications for the 2026 cycle close on 15 November 2026.",
  },
  {
    statement: "Only students enrolled in government-recognised institutions are eligible.",
    category: "eligibility",
    status: "supported",
    confidence: 76,
    source_title: "College financial aid office FAQ",
    source_url: "https://example-college.edu.in/aid/faq",
    source_date: "2026-03-18",
    excerpt: "Students enrolled in government-recognised institutions can apply.",
  },
  {
    statement: "The 2026 college FAQ lists no upper income limit for renewal applicants.",
    category: "eligibility",
    status: "uncertain",
    confidence: 52,
    source_title: "College financial aid office FAQ",
    source_url: "https://example-college.edu.in/aid/faq",
    source_date: "2026-03-18",
    excerpt: "Renewal applicants are assessed separately.",
  },
  {
    statement: "Award renewal is available for subsequent years.",
    category: "renewal",
    status: "uncertain",
    confidence: 48,
    source_title: "National Scholarship Portal — eligibility page",
    source_url: "https://scholarships.gov.in/",
    source_date: "2025-08-12",
    excerpt: "Renewal is reviewed for subsequent years of study.",
  },
  {
    statement: "Disbursement usually happens within 90 days of verification.",
    category: "contact",
    status: "uncertain",
    confidence: 38,
    source_title: "Student forum thread on scholarship payouts",
    source_url: "https://forum.example.org/threads/merit-payouts",
    source_date: "",
    excerpt:
      "Several students report that disbursement usually happens within 90 days of verification.",
  },
];

export const DEMO_GAPS = [
  {
    title: "Renewal requirements never described",
    why_it_matters:
      "No source states the attendance, marks or document requirements for continuing the award, so the second year could lapse even after a successful first application.",
    question: "What marks, attendance and documents are required to renew the award?",
    next_step: "Ask the college financial aid office for the renewal checklist in writing.",
    priority: "high",
    status: "open",
    order: 0,
  },
  {
    title: "Closing date conflict is unresolved",
    why_it_matters:
      "Two sources give different closing dates. Applying on the later assumption could mean missing the real window entirely.",
    question: "Is the closing date 31 October 2026 or 15 November 2026?",
    next_step: "Open the official notice PDF and confirm the closing date on the authority's own page.",
    priority: "high",
    status: "open",
    order: 1,
  },
  {
    title: "Document list is incomplete",
    why_it_matters:
      "The notice warns that incomplete sets are rejected without review, but no source lists the required documents.",
    question: "Which certificates must be uploaded, and who attests them?",
    next_step: "Download the scheme guidelines annexure and copy the document checklist.",
    priority: "medium",
    status: "open",
    order: 2,
  },
  {
    title: "Disbursement timeline rests on one informal source",
    why_it_matters:
      "The 90-day figure comes from a student forum, not an official communication, so it cannot be used for planning.",
    question: "What is the official disbursement timeline after verification?",
    next_step: "Find the sanction and disbursement section of the scheme guidelines.",
    priority: "low",
    status: "open",
    order: 3,
  },
];

export const DEMO_CONFLICTS = [
  {
    topic: "closing date application window cycle",
    claim_a: "The application window for the 2026 cycle closes on 31 October 2026.",
    source_a: "State Higher Education Department notice",
    url_a: "https://example.edu.in/notices/merit-scholarship-2026",
    date_a: "2026-02-04",
    excerpt_a: "The application window for the 2026 cycle closes on 31 October 2026.",
    claim_b: "Applications for the 2026 cycle close on 15 November 2026.",
    source_b: "College financial aid office FAQ",
    url_b: "https://example-college.edu.in/aid/faq",
    date_b: "2026-03-18",
    excerpt_b: "Applications for the 2026 cycle close on 15 November 2026.",
    explanation:
      "Both pages describe the same 2026 cycle but give two different closing dates, 15 days apart. The college FAQ is newer, yet the department notice is the authority that owns the window. This is a genuine contradiction until a dated official circular settles it.",
    conflict_type: "genuine",
    severity: "high",
  },
  {
    topic: "income limit eligibility renewal",
    claim_a:
      "Applicants must have scored at least 60% in the qualifying examination with an annual family income below ₹2,50,000.",
    source_a: "National Scholarship Portal — eligibility page",
    url_a: "https://scholarships.gov.in/",
    date_a: "2025-08-12",
    excerpt_a: "come from a family with an annual income below ₹2,50,000",
    claim_b: "The 2026 college FAQ lists no upper income limit for renewal applicants.",
    source_b: "College financial aid office FAQ",
    url_b: "https://example-college.edu.in/aid/faq",
    date_b: "2026-03-18",
    excerpt_b: "Renewal applicants are assessed separately.",
    explanation:
      "The portal states an income ceiling while the newer college FAQ describes renewal applicants without one. Because the portal page is from the 2025 cycle, this is most likely a difference of cycle and applicant category rather than a true contradiction — but the current rule must be confirmed.",
    conflict_type: "date",
    severity: "medium",
  },
];

export const DEMO_FRESHNESS = [
  {
    source_title: "National Scholarship Portal — eligibility page",
    source_url: "https://scholarships.gov.in/",
    published_date: "2025-08-12",
    reason: "Refers to an earlier cycle",
    detail:
      "This page was published for the previous academic cycle. Amounts and income ceilings shown on it may already have changed, so treat every figure as unverified until you open the current year's page.",
    severity: "high",
  },
  {
    source_title: "Student forum thread on scholarship payouts",
    source_url: "https://forum.example.org/threads/merit-payouts",
    published_date: "",
    reason: "Publication date unavailable",
    detail:
      "No publication or last-updated date is visible, so claims about payouts and portal outages cannot be placed in time.",
    severity: "low",
  },
  {
    source_title: "State Higher Education Department notice",
    source_url: "https://example.edu.in/notices/merit-scholarship-2026",
    published_date: "2026-02-04",
    reason: "Deadline stated in an early notice",
    detail:
      "The notice states a closing date of 31 October 2026. Because extensions are common and this notice predates the FAQ, confirm the live date on the portal before planning around it.",
    severity: "medium",
  },
];

export const DEMO_CHECKLIST = [
  {
    title: "Verify: Closing date conflict is unresolved",
    description: "Is the closing date 31 October 2026 or 15 November 2026?",
    priority: "high",
    status: "in_progress",
    notes: "Called the department helpline — asked for the circular number that supersedes the February notice.",
    recommended_url: "https://example.edu.in/notices/merit-scholarship-2026",
    recommended_label: "Open department notice",
    order: 0,
  },
  {
    title: "Verify: Renewal requirements never described",
    description: "What marks, attendance and documents are required to renew the award?",
    priority: "high",
    status: "todo",
    notes: "",
    recommended_url: "https://example-college.edu.in/aid/faq",
    recommended_label: "Open college FAQ",
    order: 1,
  },
  {
    title: "Resolve conflict: income limit eligibility renewal",
    description:
      "Check whether the ₹2,50,000 income ceiling still applies to the 2026 cycle and to renewal applicants.",
    priority: "medium",
    status: "done",
    notes: "Confirmed with the aid office: the ceiling applies to first-time applicants only.",
    recommended_url: "https://scholarships.gov.in/",
    recommended_label: "Open scholarship portal",
    order: 2,
  },
  {
    title: "Verify: Document list is incomplete",
    description: "Which certificates must be uploaded, and who attests them?",
    priority: "medium",
    status: "todo",
    notes: "",
    recommended_url: "",
    recommended_label: "Open research sources",
    order: 3,
  },
  {
    title: "Re-check freshness: National Scholarship Portal — eligibility page",
    description:
      "This page belongs to the previous cycle. Find the current-year eligibility page before quoting amounts.",
    priority: "high",
    status: "todo",
    notes: "",
    recommended_url: "https://scholarships.gov.in/",
    recommended_label: "Open source",
    order: 4,
  },
  {
    title: "Verify: Disbursement timeline rests on one informal source",
    description: "What is the official disbursement timeline after verification?",
    priority: "low",
    status: "todo",
    notes: "",
    recommended_url: "https://forum.example.org/threads/merit-payouts",
    recommended_label: "Open forum thread",
    order: 5,
  },
];