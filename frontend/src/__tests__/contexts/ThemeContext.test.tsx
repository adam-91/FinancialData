import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeContextProvider, useTheme } from "../../contexts/ThemeContext";

function ThemeConsumer() {
  const { themeMode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="mode">{themeMode}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeContext", () => {
  it("should default to light theme when no localStorage", () => {
    render(
      <ThemeContextProvider>
        <ThemeConsumer />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId("mode").textContent).toBe("light");
  });

  it("should read theme from localStorage", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeContextProvider>
        <ThemeConsumer />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId("mode").textContent).toBe("dark");
  });

  it("should toggle theme from light to dark", () => {
    render(
      <ThemeContextProvider>
        <ThemeConsumer />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId("mode").textContent).toBe("light");
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("mode").textContent).toBe("dark");
  });

  it("should toggle theme from dark to light", () => {
    localStorage.setItem("theme", "dark");
    render(
      <ThemeContextProvider>
        <ThemeConsumer />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId("mode").textContent).toBe("dark");
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("mode").textContent).toBe("light");
  });

  it("should save theme to localStorage on toggle", () => {
    render(
      <ThemeContextProvider>
        <ThemeConsumer />
      </ThemeContextProvider>
    );
    fireEvent.click(screen.getByText("Toggle"));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should throw error when useTheme is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThemeConsumer />)).toThrow(
      "useTheme must be used within ThemeContextProvider"
    );
    consoleError.mockRestore();
  });
});
