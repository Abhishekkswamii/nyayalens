export type ConcernLevel = "high" | "medium" | "low" | "info";
export type Confidence = "high" | "medium" | "low";

export interface EvidenceCitation {
  page: number | null;
  section: string | null;
  quote: string | null;
  available: boolean;
}

export interface LegalClause {
  id: string;
  title: string;
  category: string;
  page: number | null;
  section: string | null;
  originalText: string;
  plainEnglish: string;
  concernLevel: ConcernLevel;
  whyItMatters: string;
  evidence: EvidenceCitation;
  confidence: Confidence;
  recommendedQuestion: string;
}

export interface Obligation {
  id: string;
  party: string;
  obligation: string;
  timing: string;
  consequence: string;
  evidence: EvidenceCitation;
}

export interface Right {
  id: string;
  party: string;
  description: string;
  evidence: EvidenceCitation;
}

export interface RiskFinding {
  id: string;
  clauseId: string | null;
  title: string;
  concernLevel: ConcernLevel;
  explanation: string;
  evidence: EvidenceCitation;
}

export interface DocumentMetadata {
  documentType: string;
  parties: string[];
  effectiveDate: string | null;
  duration: string | null;
  jurisdiction: string | null;
}

export interface RiskSummary {
  totalClauses: number;
  high: number;
  medium: number;
  low: number;
  keyTakeaway: string;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
}

export interface LawyerPrepItem {
  id: string;
  topic: string;
  question: string;
  relatedClauseId: string | null;
}

export interface DocumentAnalysis {
  sessionId: string;
  fileName: string;
  pageCount: number;
  fileSizeBytes: number;
  metadata: DocumentMetadata;
  summary: string;
  clauses: LegalClause[];
  obligations: Obligation[];
  rights: Right[];
  risks: RiskFinding[];
  riskSummary: RiskSummary;
  suggestedQuestions: SuggestedQuestion[];
  lawyerPrep: LawyerPrepItem[];
  isDemo: boolean;
  createdAt: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  whatDocumentSays: string;
  evidence: EvidenceCitation[];
  uncertainty: string | null;
  suggestedNextQuestion: string | null;
  confidence: Confidence;
  grounded: boolean;
}

export interface ComparisonRow {
  dimension: string;
  documentA: string;
  documentB: string;
  evidenceA: EvidenceCitation;
  evidenceB: EvidenceCitation;
  differs: boolean;
}

export interface MaterialDifference {
  dimension: string;
  whatChanged: string;
  whyItMayMatter: string;
}

export interface ComparisonResult {
  documentAName: string;
  documentBName: string;
  rows: ComparisonRow[];
  materialDifferences: MaterialDifference[];
}
