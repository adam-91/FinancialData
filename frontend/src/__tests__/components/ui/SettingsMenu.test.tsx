import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test-utils";
import { AuthProvider } from "../../../contexts/AuthContext";
import { SettingsProvider } from "../../../contexts/SettingsContext";
import { SettingsMenu } from "../../../components/ui/SettingsMenu";
import * as authApi from "../../../api/auth";

vi.mock("../../../api/auth", () => ({
  getMe: vi.fn().mockResolvedValue(null),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("../../../api/preferences", () => ({
  getPreferences: vi.fn().mockResolvedValue({
    default_exchange: null,
    default_currencies: [],
  }),
  updatePreferences: vi.fn(),
}));

vi.mock("../../../hooks/useIndices", () => ({
  useIndices: () => ({
    data: [
      { id: 1, symbol: "^WIG20", name: "WIG 20", stock_exchange: "GPW", active: true },
      { id: 2, symbol: "^GSPC", name: "S&P 500", stock_exchange: "NYSE", active: true },
    ],
    isLoading: false,
  }),
  useIndexHistory: vi.fn(),
}));

vi.mock("../../../hooks/useCurrency", () => ({
  useCurrencies: () => ({
    data: [
      { id: 1, code: "EUR", name: "Euro" },
      { id: 2, code: "USD", name: "US Dollar" },
    ],
    isLoading: false,
  }),
}));

function renderMenu() {
  return render(
    <AuthProvider>
      <SettingsProvider>
        <SettingsMenu onOpenChangePassword={() => {}} />
      </SettingsProvider>
    </AuthProvider>
  );
}

describe("SettingsMenu", () => {
  it("renders the gear button", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("shows default exchange selector with options", () => {
    const { container } = renderMenu();
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
    expect(select?.querySelectorAll("option").length).toBeGreaterThanOrEqual(3);
  });

  it("hides the change password button when logged out", () => {
    renderMenu();
    expect(screen.queryByText("Change password")).not.toBeInTheDocument();
  });

  it("shows the change password button when logged in", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      id: 1,
      email: "user@example.com",
      role: "user",
      is_active: true,
      created_at: "2026-08-16T00:00:00Z",
    });

    renderMenu();

    expect(
      await screen.findByText("Change password")
    ).toBeInTheDocument();
  });
});
