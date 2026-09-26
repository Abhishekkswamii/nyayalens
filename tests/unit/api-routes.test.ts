// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Spy on the AI client without breaking `instanceof` checks elsewhere (e.g.
// lib/api/respond.ts matching error classes) by keeping every real export
// and only wrapping the network-calling functions. These spies exist purely
// to prove that invalid input and demo-mode requests never reach the model
// — a real, testable efficiency guarantee, not just an assertion in prose.
vi.mock("@/lib/ai/gemini", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ai/gemini")>("@/lib/ai/gemini");
  return {
    ...actual,
    prepareDocument: vi.fn(),
    generateAnalysis: vi.fn(),
    generateAnswer: vi.fn(),
    generateComparison: vi.fn(),
  };
});

const gemini = await import("@/lib/ai/gemini");
const askModule = await import("@/app/api/ask/route");
const analyzeModule = await import("@/app/api/analyze/route");
const askRoute = askModule.POST;
const analyzeRoute = analyzeModule.POST;

beforeEach(() => {
  vi.clearAllMocks();
});

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ask", () => {
  it("answers a demo question without calling the AI service", async () => {
    const request = jsonRequest("http://localhost/api/ask", {
      question: "Does this agreement contain a non-compete clause?",
      isDemo: true,
    });
    const response = await askRoute(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.answer.grounded).toBe(true);
    expect(body.answer.evidence.length).toBeGreaterThan(0);
    expect(gemini.generateAnswer).not.toHaveBeenCalled();
  });

  it("rejects an empty question before any AI call", async () => {
    const request = jsonRequest("http://localhost/api/ask", { question: "", isDemo: true });
    const response = await askRoute(request);
    expect(response.status).toBe(400);
    expect(gemini.generateAnswer).not.toHaveBeenCalled();
  });

  it("rejects a live request with no document session before any AI call", async () => {
    const request = jsonRequest("http://localhost/api/ask", {
      question: "What is this?",
      isDemo: false,
    });
    const response = await askRoute(request);
    expect(response.status).toBe(400);
    expect(gemini.generateAnswer).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON bodies", async () => {
    const request = new NextRequest("http://localhost/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not valid json",
    });
    const response = await askRoute(request);
    expect(response.status).toBe(400);
  });
});

describe("POST /api/analyze", () => {
  it("rejects a request with no file", async () => {
    const formData = new FormData();
    const request = new Request("http://localhost/api/analyze", { method: "POST", body: formData });
    const response = await analyzeRoute(request as unknown as NextRequest);
    expect(response.status).toBe(400);
  });

  it("rejects a non-PDF file", async () => {
    const formData = new FormData();
    formData.append("file", new File(["hello"], "notes.txt", { type: "text/plain" }));
    const request = new Request("http://localhost/api/analyze", { method: "POST", body: formData });
    const response = await analyzeRoute(request as unknown as NextRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/PDF/i);
    expect(gemini.prepareDocument).not.toHaveBeenCalled();
    expect(gemini.generateAnalysis).not.toHaveBeenCalled();
  });

  it("rejects a file whose content is not actually a PDF despite the extension", async () => {
    const formData = new FormData();
    formData.append("file", new File(["not a real pdf"], "fake.pdf", { type: "application/pdf" }));
    const request = new Request("http://localhost/api/analyze", { method: "POST", body: formData });
    const response = await analyzeRoute(request as unknown as NextRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/valid PDF/i);
    expect(gemini.prepareDocument).not.toHaveBeenCalled();
    expect(gemini.generateAnalysis).not.toHaveBeenCalled();
  });
});
