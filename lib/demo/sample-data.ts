import type { ComparisonResult, DocumentAnalysis, QuestionAnswer } from "@/lib/types";

/**
 * Tiny synthetic sample data for demo mode. Not a real contract, no real
 * parties, no copyrighted text — written for this project.
 */
export const DEMO_SESSION_ID = "demo-session";
export const DEMO_FILE_NAME = "Sample Employment Agreement (Demo).pdf";

export const DEMO_ANALYSIS: DocumentAnalysis = {
  sessionId: DEMO_SESSION_ID,
  fileName: DEMO_FILE_NAME,
  pageCount: 6,
  fileSizeBytes: 182_000,
  metadata: {
    documentType: "Employment Agreement",
    parties: ["Employee (Demo)", "ABC Technologies Pvt. Ltd. (Demo)"],
    effectiveDate: "1 January 2024",
    duration: "12 months, with a 3-month probation period",
    jurisdiction: "India (as stated in the sample document)",
  },
  summary:
    "This is a synthetic sample employment agreement between a demo employee and a demo company. It outlines role, compensation, a three-month probation period, confidentiality obligations, intellectual-property assignment, a post-employment non-compete, and termination terms. This is demo data, not a real contract.",
  clauses: [
    {
      id: "c1",
      title: "Employment Term",
      category: "general",
      page: 1,
      section: "1.2",
      originalText: "This Agreement shall commence on the Effective Date and continue for 12 months unless terminated earlier in accordance with Section 7.",
      plainEnglish: "The job is for a fixed 12-month term unless it ends early under the termination clause.",
      concernLevel: "low",
      whyItMatters: "Confirms how long the arrangement is expected to last.",
      evidence: { page: 1, section: "1.2", quote: "This Agreement shall commence on the Effective Date and continue for 12 months...", available: true },
      confidence: "high",
      recommendedQuestion: "What happens if neither party acts when the 12-month term ends?",
    },
    {
      id: "c2",
      title: "Probation Period",
      category: "employment",
      page: 2,
      section: "2.1",
      originalText: "The first three (3) months of employment shall be a probationary period during which either party may terminate employment with 7 days' written notice.",
      plainEnglish: "For the first 3 months, either side can end the job with just 7 days' notice.",
      concernLevel: "medium",
      whyItMatters: "Notice periods are much shorter during probation, which affects job security early on.",
      evidence: { page: 2, section: "2.1", quote: "...either party may terminate employment with 7 days' written notice.", available: true },
      confidence: "high",
      recommendedQuestion: "Can the probation period be extended, and if so, how?",
    },
    {
      id: "c3",
      title: "Compensation",
      category: "payment",
      page: 2,
      section: "3.1",
      originalText: "The Employee shall be paid a gross monthly salary as set out in Schedule A, payable on the last working day of each month.",
      plainEnglish: "Salary is paid monthly, on the last working day, per the amount in Schedule A.",
      concernLevel: "low",
      whyItMatters: "Establishes the payment amount reference and schedule.",
      evidence: { page: 2, section: "3.1", quote: "...payable on the last working day of each month.", available: true },
      confidence: "high",
      recommendedQuestion: "Does Schedule A specify how raises or bonuses are decided?",
    },
    {
      id: "c4",
      title: "Confidentiality",
      category: "confidentiality",
      page: 3,
      section: "4.2",
      originalText: "The Employee agrees to keep all confidential information of the Company secret both during and after employment, without limitation in time.",
      plainEnglish: "Confidentiality obligations continue indefinitely, even after the job ends.",
      concernLevel: "medium",
      whyItMatters: "An indefinite confidentiality duty is broad and worth understanding clearly before signing.",
      evidence: { page: 3, section: "4.2", quote: "...without limitation in time.", available: true },
      confidence: "high",
      recommendedQuestion: "Are there any categories of information excluded from this confidentiality duty?",
    },
    {
      id: "c5",
      title: "Intellectual Property",
      category: "intellectual-property",
      page: 3,
      section: "5.1",
      originalText: "All inventions, works, and materials created by the Employee during the course of employment, whether or not during working hours, shall be the sole property of the Company.",
      plainEnglish: "Anything the employee creates during employment — even outside work hours — belongs to the company.",
      concernLevel: "high",
      whyItMatters: "Assigning IP created outside working hours is a broad clause that can affect personal projects.",
      evidence: { page: 3, section: "5.1", quote: "...whether or not during working hours, shall be the sole property of the Company.", available: true },
      confidence: "high",
      recommendedQuestion: "Does this clause cover personal projects unrelated to the Company's business?",
    },
    {
      id: "c6",
      title: "Non-Compete",
      category: "restrictions",
      page: 4,
      section: "6.3",
      originalText: "For 12 months following termination, the Employee shall not engage with any business that competes with the Company within India.",
      plainEnglish: "A 12-month, India-wide restriction on joining or starting a competing business after leaving.",
      concernLevel: "high",
      whyItMatters: "Post-employment non-competes can significantly affect future job options and their enforceability varies by jurisdiction.",
      evidence: { page: 4, section: "6.3", quote: "For 12 months following termination, the Employee shall not engage with any business that competes with the Company within India.", available: true },
      confidence: "medium",
      recommendedQuestion: "Is this non-compete clause enforceable in the relevant jurisdiction, and what counts as a 'competing business'?",
    },
    {
      id: "c7",
      title: "Termination",
      category: "termination",
      page: 4,
      section: "7.2",
      originalText: "After the probationary period, either party may terminate this Agreement with 30 days' written notice, or immediately for cause as defined in Section 7.4.",
      plainEnglish: "After probation, 30 days' notice is required to end employment, except in defined 'for cause' situations.",
      concernLevel: "high",
      whyItMatters: "The 'for cause' immediate-termination provision is important to review before signing.",
      evidence: { page: 4, section: "7.2", quote: "...or immediately for cause as defined in Section 7.4.", available: true },
      confidence: "high",
      recommendedQuestion: "What exact situations qualify as 'cause' under Section 7.4?",
    },
    {
      id: "c8",
      title: "Dispute Resolution",
      category: "dispute-resolution",
      page: 5,
      section: "8.1",
      originalText: "Any dispute arising out of this Agreement shall first be referred to mediation, and if unresolved, to binding arbitration.",
      plainEnglish: "Disputes go through mediation first, then binding arbitration rather than court.",
      concernLevel: "medium",
      whyItMatters: "Arbitration clauses can affect a person's ability to pursue claims in regular courts.",
      evidence: { page: 5, section: "8.1", quote: "...and if unresolved, to binding arbitration.", available: true },
      confidence: "high",
      recommendedQuestion: "What are the costs and location of the arbitration process described here?",
    },
  ],
  obligations: [
    {
      id: "o1",
      party: "Employee",
      obligation: "Maintain confidentiality of Company information",
      timing: "Ongoing, including after employment ends",
      consequence: "Contractual consequences as described in Section 4",
      evidence: { page: 3, section: "4.2", quote: "...keep all confidential information of the Company secret...", available: true },
    },
    {
      id: "o2",
      party: "Employer",
      obligation: "Pay monthly salary",
      timing: "Monthly, on the last working day",
      consequence: "Payment obligation under Section 3",
      evidence: { page: 2, section: "3.1", quote: "...payable on the last working day of each month.", available: true },
    },
    {
      id: "o3",
      party: "Employee",
      obligation: "Provide notice before resigning (post-probation)",
      timing: "30 days",
      consequence: "Notice requirement under Section 7.2",
      evidence: { page: 4, section: "7.2", quote: "...either party may terminate this Agreement with 30 days' written notice...", available: true },
    },
  ],
  rights: [
    {
      id: "r1",
      party: "Employee",
      description: "Entitled to gross monthly salary as set out in Schedule A.",
      evidence: { page: 2, section: "3.1", quote: "The Employee shall be paid a gross monthly salary as set out in Schedule A...", available: true },
    },
    {
      id: "r2",
      party: "Employee",
      description: "Entitled to 7 days' written notice before termination during probation.",
      evidence: { page: 2, section: "2.1", quote: "...either party may terminate employment with 7 days' written notice.", available: true },
    },
    {
      id: "r3",
      party: "Employee",
      description: "Entitled to mediation before binding arbitration in a dispute.",
      evidence: { page: 5, section: "8.1", quote: "Any dispute arising out of this Agreement shall first be referred to mediation...", available: true },
    },
  ],
  risks: [
    {
      id: "risk1",
      clauseId: "c5",
      title: "Broad intellectual property assignment",
      concernLevel: "high",
      explanation: "The IP clause is not limited to work-related creations or working hours, which is broader than many standard agreements.",
      evidence: { page: 3, section: "5.1", quote: "...whether or not during working hours, shall be the sole property of the Company.", available: true },
    },
    {
      id: "risk2",
      clauseId: "c6",
      title: "Post-employment non-compete restriction",
      concernLevel: "high",
      explanation: "A 12-month nationwide non-compete may limit future employment options; enforceability varies by jurisdiction.",
      evidence: { page: 4, section: "6.3", quote: "For 12 months following termination, the Employee shall not engage with any business that competes with the Company within India.", available: true },
    },
    {
      id: "risk3",
      clauseId: "c7",
      title: "Immediate termination 'for cause'",
      concernLevel: "medium",
      explanation: "The document references a 'for cause' definition in Section 7.4 that should be read carefully before signing.",
      evidence: { page: 4, section: "7.2", quote: "...or immediately for cause as defined in Section 7.4.", available: true },
    },
    {
      id: "risk4",
      clauseId: "c4",
      title: "Indefinite confidentiality duty",
      concernLevel: "medium",
      explanation: "Confidentiality obligations that never expire are broad; consider whether any information should be excluded.",
      evidence: { page: 3, section: "4.2", quote: "...without limitation in time.", available: true },
    },
    {
      id: "risk5",
      clauseId: "c8",
      title: "Mandatory arbitration",
      concernLevel: "medium",
      explanation: "Arbitration clauses affect how disputes are resolved and may limit access to standard court proceedings.",
      evidence: { page: 5, section: "8.1", quote: "...and if unresolved, to binding arbitration.", available: true },
    },
  ],
  riskSummary: {
    totalClauses: 8,
    high: 3,
    medium: 4,
    low: 1,
    keyTakeaway:
      "This sample agreement contains high-concern clauses mainly related to intellectual property assignment and post-employment restrictions — worth discussing with a professional before signing.",
  },
  suggestedQuestions: [
    { id: "q1", question: "Can my employer terminate me immediately?" },
    { id: "q2", question: "What are my key obligations in this agreement?" },
    { id: "q3", question: "Does this agreement contain a non-compete clause?" },
    { id: "q4", question: "What happens during the probation period?" },
    { id: "q5", question: "What happens if I resign early?" },
    { id: "q6", question: "What should I ask a lawyer before signing?" },
  ],
  lawyerPrep: [
    { id: "lp1", topic: "Intellectual property scope", question: "Does the IP assignment in Section 5.1 cover personal projects unrelated to company business?", relatedClauseId: "c5" },
    { id: "lp2", topic: "Non-compete enforceability", question: "Is the 12-month, India-wide non-compete in Section 6.3 enforceable where I will work?", relatedClauseId: "c6" },
    { id: "lp3", topic: "Termination for cause", question: "What specific circumstances qualify as 'cause' under Section 7.4?", relatedClauseId: "c7" },
    { id: "lp4", topic: "Confidentiality duration", question: "Can the indefinite confidentiality duty in Section 4.2 be limited to a fixed term?", relatedClauseId: "c4" },
  ],
  isDemo: true,
  createdAt: new Date().toISOString(),
};

const DEMO_QA_BANK: Array<{ match: RegExp; answer: QuestionAnswer }> = [
  {
    match: /terminat|fire|immediat/i,
    answer: {
      question: "Can my employer terminate me immediately?",
      answer:
        "After probation, the document requires 30 days' written notice, except when ending employment 'for cause' as defined in Section 7.4, which is not fully detailed in the excerpt available.",
      whatDocumentSays:
        "Section 7.2 states either party may terminate with 30 days' written notice, or immediately for cause as defined in Section 7.4.",
      evidence: [{ page: 4, section: "7.2", quote: "...or immediately for cause as defined in Section 7.4.", available: true }],
      uncertainty: "The document does not fully define every circumstance that counts as 'cause' in the excerpt reviewed.",
      suggestedNextQuestion: "What specific circumstances qualify as 'cause' under Section 7.4?",
      confidence: "high",
      grounded: true,
    },
  },
  {
    match: /obligat/i,
    answer: {
      question: "What are my key obligations in this agreement?",
      answer:
        "The document states the employee must maintain confidentiality indefinitely and give 30 days' notice before resigning after probation.",
      whatDocumentSays:
        "Section 4.2 requires ongoing confidentiality; Section 7.2 requires 30 days' written notice to terminate after probation.",
      evidence: [
        { page: 3, section: "4.2", quote: "...keep all confidential information of the Company secret...", available: true },
        { page: 4, section: "7.2", quote: "...either party may terminate this Agreement with 30 days' written notice...", available: true },
      ],
      uncertainty: null,
      suggestedNextQuestion: "Are there any categories of information excluded from the confidentiality duty?",
      confidence: "high",
      grounded: true,
    },
  },
  {
    match: /non.?compete/i,
    answer: {
      question: "Does this agreement contain a non-compete clause?",
      answer:
        "Yes. The document states a 12-month, India-wide restriction on joining or starting a competing business after employment ends.",
      whatDocumentSays: "Section 6.3 restricts competing business activity for 12 months following termination, within India.",
      evidence: [{ page: 4, section: "6.3", quote: "For 12 months following termination, the Employee shall not engage with any business that competes with the Company within India.", available: true }],
      uncertainty: "The document does not clarify how 'competing business' is defined, and enforceability of non-competes varies by jurisdiction.",
      suggestedNextQuestion: "Is this non-compete clause enforceable in the relevant jurisdiction?",
      confidence: "high",
      grounded: true,
    },
  },
  {
    match: /probation/i,
    answer: {
      question: "What happens during the probation period?",
      answer:
        "During the first 3 months, either party can end the employment with just 7 days' written notice — much shorter than the standard 30-day notice.",
      whatDocumentSays: "Section 2.1 sets a 3-month probationary period with 7 days' written notice for termination by either party.",
      evidence: [{ page: 2, section: "2.1", quote: "...either party may terminate employment with 7 days' written notice.", available: true }],
      uncertainty: "The document excerpt does not state whether probation can be extended.",
      suggestedNextQuestion: "Can the probation period be extended, and if so, how?",
      confidence: "high",
      grounded: true,
    },
  },
];

const FALLBACK_ANSWER: QuestionAnswer = {
  question: "",
  answer: "I couldn't find enough information in the uploaded document to answer that reliably.",
  whatDocumentSays: "The demo document does not appear to address this question directly.",
  evidence: [],
  uncertainty: "This demo dataset is small and may not cover every topic.",
  suggestedNextQuestion: "What should I ask a lawyer before signing?",
  confidence: "low",
  grounded: false,
};

export function answerDemoQuestion(question: string): QuestionAnswer {
  const match = DEMO_QA_BANK.find((entry) => entry.match.test(question));
  if (match) return { ...match.answer, question };
  return { ...FALLBACK_ANSWER, question };
}

export const DEMO_COMPARISON: ComparisonResult = {
  documentAName: "Sample Employment Agreement — Version A (Demo)",
  documentBName: "Sample Employment Agreement — Version B (Demo)",
  rows: [
    {
      dimension: "Termination notice",
      documentA: "30 days' written notice after probation",
      documentB: "7 days' written notice after probation",
      evidenceA: { page: 4, section: "7.2", quote: "...either party may terminate this Agreement with 30 days' written notice...", available: true },
      evidenceB: { page: 3, section: "6.1", quote: "...either party may terminate this Agreement with 7 days' written notice...", available: true },
      differs: true,
    },
    {
      dimension: "Non-compete duration",
      documentA: "12 months, India-wide",
      documentB: "6 months, India-wide",
      evidenceA: { page: 4, section: "6.3", quote: "For 12 months following termination...", available: true },
      evidenceB: { page: 4, section: "7.1", quote: "For 6 months following termination...", available: true },
      differs: true,
    },
    {
      dimension: "Confidentiality duration",
      documentA: "Indefinite",
      documentB: "Indefinite",
      evidenceA: { page: 3, section: "4.2", quote: "...without limitation in time.", available: true },
      evidenceB: { page: 3, section: "4.2", quote: "...without limitation in time.", available: true },
      differs: false,
    },
    {
      dimension: "Dispute resolution",
      documentA: "Mediation, then binding arbitration",
      documentB: "Binding arbitration only",
      evidenceA: { page: 5, section: "8.1", quote: "...shall first be referred to mediation, and if unresolved, to binding arbitration.", available: true },
      evidenceB: { page: 5, section: "8.1", quote: "...shall be resolved through binding arbitration.", available: true },
      differs: true,
    },
  ],
  materialDifferences: [
    {
      dimension: "Termination notice",
      whatChanged: "Document B allows termination with much shorter notice (7 days vs. 30 days).",
      whyItMayMatter: "A shorter notice period gives less time to plan a transition if employment ends.",
    },
    {
      dimension: "Non-compete duration",
      whatChanged: "Document B's non-compete period is half as long as Document A's.",
      whyItMayMatter: "A shorter restriction period may be less limiting for future employment.",
    },
    {
      dimension: "Dispute resolution",
      whatChanged: "Document B skips mediation and goes directly to binding arbitration.",
      whyItMayMatter: "Removing a mediation step changes how a dispute would first be addressed.",
    },
  ],
};
