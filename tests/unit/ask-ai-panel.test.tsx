import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { AskAiPanel } from "@/components/ask-ai-panel";
import { DocumentSessionProvider, useDocumentSession } from "@/lib/client/session-context";

function DemoHarness() {
  const { loadDemo } = useDocumentSession();
  useEffect(() => {
    loadDemo();
  }, [loadDemo]);
  return <AskAiPanel />;
}

describe("AskAiPanel — duplicate request guard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    answer: {
                      question: "q",
                      answer: "a",
                      whatDocumentSays: "d",
                      evidence: [],
                      uncertainty: null,
                      suggestedNextQuestion: null,
                      confidence: "high",
                      grounded: true,
                    },
                  }),
                } as Response),
              50,
            );
          }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("only sends one request when a suggested question is clicked twice while pending", async () => {
    render(
      <DocumentSessionProvider>
        <DemoHarness />
      </DocumentSessionProvider>,
    );

    const button = await screen.findByRole("button", {
      name: /Can my employer terminate me immediately\?/,
    });

    fireEvent.click(button);
    // The button disables itself as soon as a request starts (see
    // AskAiPanel's disabled={loading}), so a second click is a real DOM
    // no-op here — not just a state-flag check that could race.
    fireEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    fireEvent.click(button); // still a no-op: the element is disabled

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await waitFor(() => expect(button).not.toBeDisabled());
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
