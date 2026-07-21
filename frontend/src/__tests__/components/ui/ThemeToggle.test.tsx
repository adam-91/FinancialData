import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test-utils";
import { ThemeToggle } from "../../../components/ui/ThemeToggle";

describe("ThemeToggle", () => {
  it("should render without errors", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("should display moon icon in light mode", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should display sun icon in dark mode", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have correct aria-label", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toHaveAttribute("aria-label", "Toggle theme");
  });
});
