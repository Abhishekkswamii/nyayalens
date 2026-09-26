import { describe, expect, it } from "vitest";
import {
  analysisSchema,
  documentMetadataSchema,
  documentRefSchema,
  evidenceCitationSchema,
  qaSchema,
  uploadValidationSchema,
} from "@/lib/validation/schemas";
import { DEMO_ANALYSIS, answerDemoQuestion } from "@/lib/demo/sample-data";

const validEvidence = { page: 3, section: "4.2", quote: "some quote", available: true };

describe("evidenceCitationSchema", () => {
  it("accepts a well-formed citation", () => {
    expect(evidenceCitationSchema.safeParse(validEvidence).success).toBe(true);
  });

  it("accepts an unavailable citation with null fields", () => {
    expect(
      evidenceCitationSchema.safeParse({ page: null, section: null, quote: null, available: false }).success,
    ).toBe(true);
  });

  it("rejects a negative page number", () => {
    expect(evidenceCitationSchema.safeParse({ ...validEvidence, page: -1 }).success).toBe(false);
  });
});

describe("analysisSchema", () => {
  it("validates the demo analysis payload shape", () => {
    const { sessionId, fileName, pageCount, fileSizeBytes, isDemo, createdAt, ...payload } = DEMO_ANALYSIS;
    void sessionId;
    void fileName;
    void pageCount;
    void fileSizeBytes;
    void isDemo;
    void createdAt;
    const result = analysisSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid clause category", () => {
    const bad = {
      metadata: { documentType: "NDA", parties: [], effectiveDate: null, duration: null, jurisdiction: null },
      summary: "test",
      clauses: [
        {
          id: "c1",
          title: "Bad",
          category: "not-a-real-category",
          page: 1,
          section: null,
          originalText: "text",
          plainEnglish: "text",
          concernLevel: "low",
          whyItMatters: "text",
          evidence: validEvidence,
          confidence: "high",
          recommendedQuestion: "?",
        },
      ],
      obligations: [],
      rights: [],
      risks: [],
      riskSummary: { totalClauses: 1, high: 0, medium: 0, low: 1, keyTakeaway: "ok" },
      suggestedQuestions: [],
      lawyerPrep: [],
    };
    expect(analysisSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects output missing required fields", () => {
    expect(analysisSchema.safeParse({}).success).toBe(false);
  });
});

describe("qaSchema", () => {
  it("validates a well-formed answer", () => {
    const answer = answerDemoQuestion("Can my employer terminate me immediately?");
    const { question, ...rest } = answer;
    void question;
    expect(qaSchema.safeParse(rest).success).toBe(true);
  });
});

describe("documentMetadataSchema", () => {
  it("accepts a real multi-party document (e.g. a complaint naming many defendants)", () => {
    const parties = Array.from({ length: 11 }, (_, i) => `Party ${i + 1}`);
    const result = documentMetadataSchema.safeParse({
      documentType: "Complaint",
      parties,
      effectiveDate: null,
      duration: null,
      jurisdiction: null,
    });
    expect(result.success).toBe(true);
  });

  it("still rejects a runaway/unbounded parties list", () => {
    const parties = Array.from({ length: 100 }, (_, i) => `Party ${i + 1}`);
    const result = documentMetadataSchema.safeParse({
      documentType: "Complaint",
      parties,
      effectiveDate: null,
      duration: null,
      jurisdiction: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("documentRefSchema", () => {
  it("accepts a valid Gemini Files API reference", () => {
    const result = documentRefSchema.safeParse({
      kind: "file",
      uri: "https://generativelanguage.googleapis.com/v1beta/files/abc123",
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid inline (Vertex AI) reference", () => {
    const result = documentRefSchema.safeParse({
      kind: "inline",
      base64: "JVBERi0xLjQK",
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a file reference pointing at an untrusted host", () => {
    const result = documentRefSchema.safeParse({
      kind: "file",
      uri: "https://evil.example.com/files/abc123",
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an oversized inline payload", () => {
    const result = documentRefSchema.safeParse({
      kind: "inline",
      base64: "A".repeat(30 * 1024 * 1024),
      mimeType: "application/pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing/undefined doc", () => {
    expect(documentRefSchema.safeParse(undefined).success).toBe(false);
    expect(documentRefSchema.safeParse(null).success).toBe(false);
  });
});

describe("uploadValidationSchema", () => {
  it("rejects a non-pdf mime type at the type level", () => {
    const result = uploadValidationSchema.safeParse({
      fileName: "doc.pdf",
      mimeType: "application/msword",
      sizeBytes: 100,
    });
    expect(result.success).toBe(false);
  });
});
