import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConcernBadge } from "@/components/concern-badge";

describe("ConcernBadge", () => {
  it("renders a text label alongside the color, never color alone", () => {
    render(<ConcernBadge level="high" />);
    expect(screen.getByText("High concern")).toBeInTheDocument();
  });

  it.each([
    ["high", "High concern"],
    ["medium", "Medium concern"],
    ["low", "Low concern"],
    ["info", "Informational"],
  ] as const)("renders the correct label for %s", (level, label) => {
    render(<ConcernBadge level={level} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
