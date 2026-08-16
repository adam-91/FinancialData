import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../test-utils";
import { AuthProvider } from "../../contexts/AuthContext";
import {
  SettingsProvider,
  useSettings,
} from "../../contexts/SettingsContext";

vi.mock("../../api/auth", () => ({
  getMe: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("../../api/preferences", () => ({
  getPreferences: vi.fn(),
  updatePreferences: vi.fn(),
}));

function Harness() {
  const {
    defaultExchange,
    defaultCurrencies,
    setDefaultExchange,
    setDefaultCurrencies,
  } = useSettings();

  return (
    <div>
      <span data-testid="exchange">{defaultExchange ?? "none"}</span>
      <span data-testid="currencies">{defaultCurrencies.join(",")}</span>
      <button onClick={() => setDefaultExchange("NYSE")}>set-exchange</button>
      <button onClick={() => setDefaultCurrencies(["EUR", "USD"])}>
        set-currencies
      </button>
    </div>
  );
}

function renderHarness() {
  return render(
    <AuthProvider>
      <SettingsProvider>
        <Harness />
      </SettingsProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("SettingsContext", () => {
  it("loads defaults from localStorage for anonymous user", async () => {
    localStorage.setItem(
      "app-settings",
      JSON.stringify({ defaultExchange: "GPW", defaultCurrencies: ["EUR"] })
    );

    renderHarness();

    await waitFor(() =>
      expect(screen.getByTestId("exchange").textContent).toBe("GPW")
    );
    expect(screen.getByTestId("currencies").textContent).toBe("EUR");
  });

  it("uses empty defaults when no storage is present", async () => {
    renderHarness();

    await waitFor(() =>
      expect(screen.getByTestId("exchange").textContent).toBe("none")
    );
    expect(screen.getByTestId("currencies").textContent).toBe("");
  });

  it("persists settings to localStorage when anonymous", async () => {
    renderHarness();

    fireEvent.click(screen.getByText("set-exchange"));

    await waitFor(() =>
      expect(screen.getByTestId("exchange").textContent).toBe("NYSE")
    );

    const saved = JSON.parse(localStorage.getItem("app-settings") ?? "{}");
    expect(saved.defaultExchange).toBe("NYSE");
  });
});
