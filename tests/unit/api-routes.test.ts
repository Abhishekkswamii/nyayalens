// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as askRoute } from "@/app/api/ask/route";
import { POST as analyzeRoute } from "@/app/api/analyze/route";

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
  });

  it("rejects an empty question", async () => {
    const request = jsonRequest("http://localhost/api/ask", { question: "", isDemo: true });
    const response = await askRoute(request);
    expect(response.status).toBe(400);
  });

  it("rejects a live request with no document session", async () => {
    const request = jsonRequest("http://localhost/api/ask", {
      question: "What is this?",
      isDemo: false,
    });
    const response = await askRoute(request);
    expect(response.status).toBe(400);
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
  });

  it("rejects a file whose content is not actually a PDF despite the extension", async () => {
    const formData = new FormData();
    formData.append("file", new File(["not a real pdf"], "fake.pdf", { type: "application/pdf" }));
    const request = new Request("http://localhost/api/analyze", { method: "POST", body: formData });
    const response = await analyzeRoute(request as unknown as NextRequest);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/valid PDF/i);
  });
});
