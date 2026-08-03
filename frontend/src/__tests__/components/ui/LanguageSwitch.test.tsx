import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { LanguageSwitch } from "../../../components/ui/LanguageSwitch";

describe("LanguageSwitch", () => {
  it("should render without errors", () => {
    render(<LanguageSwitch />);
    expect(screen.getByText("PL")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("should have PL button active by default for Polish language", () => {
    render(<LanguageSwitch />);
    const plButton = screen.getByText("PL");
    expect(plButton).toBeInTheDocument();
  });

  it("should have EN button active for English language", () => {
    render(<LanguageSwitch />);
    const enButton = screen.getByText("EN");
    expect(enButton).toBeInTheDocument();
  });

  it("should change language when PL is clicked", () => {
    render(<LanguageSwitch />);
    const plButton = screen.getByText("PL");
    fireEvent.click(plButton);
    expect(localStorage.getItem("language")).toBe("pl");
  });

  it("should change language when EN is clicked", () => {
    render(<LanguageSwitch />);
    const enButton = screen.getByText("EN");
    fireEvent.click(enButton);
    expect(localStorage.getItem("language")).toBe("en");
  });

  it("should save language preference to localStorage", () => {
    render(<LanguageSwitch />);
    fireEvent.click(screen.getByText("EN"));
    expect(localStorage.getItem("language")).toBe("en");
    fireEvent.click(screen.getByText("PL"));
    expect(localStorage.getItem("language")).toBe("pl");
  });
});
