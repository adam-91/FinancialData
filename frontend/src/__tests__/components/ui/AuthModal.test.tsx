import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import { AuthProvider } from "../../../contexts/AuthContext";
import { AuthModal } from "../../../components/ui/AuthModal";
import { User } from "../../../types/user";
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

const mockedLogin = vi.mocked(authApi.login);
const mockedRegister = vi.mocked(authApi.register);

const user: User = {
  id: 1,
  email: "test@example.com",
  role: "user",
  is_active: true,
  created_at: "2026-08-16T00:00:00Z",
};

const STRONG_PASSWORD = "StrongPass1!";

function renderModal(view: "login" | "register" = "login", onClose = () => {}) {
  return render(
    <AuthProvider>
      <AuthModal initialView={view} onClose={onClose} />
    </AuthProvider>
  );
}

function fillEmail(value: string) {
  const input = document.querySelector(
    'input[type="email"]'
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
}

function fillConfirmPassword(value: string) {
  const inputs = document.querySelectorAll('input[type="password"]');
  const confirm = inputs[inputs.length - 1] as HTMLInputElement;
  fireEvent.change(confirm, { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthModal - rejestracja", () => {
  it("zakłada konto gdy hasło jest poprawne", async () => {
    mockedRegister.mockResolvedValue(user);
    renderModal("register");

    fillEmail("test@example.com");
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: STRONG_PASSWORD },
    });
    fillConfirmPassword(STRONG_PASSWORD);

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    await waitFor(() =>
      expect(mockedRegister).toHaveBeenCalledWith(
        "test@example.com",
        STRONG_PASSWORD
      )
    );
    expect(
      await screen.findByText("Account created. You can log in now.")
    ).toBeInTheDocument();
  });

  it("odrzuca konto gdy hasło jest za słabe", async () => {
    renderModal("register");

    fillEmail("test@example.com");
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "weak" },
    });
    fillConfirmPassword("weak");

    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(
      await screen.findByText("Password does not meet the requirements")
    ).toBeInTheDocument();
    expect(mockedRegister).not.toHaveBeenCalled();
  });
});

describe("AuthModal - logowanie", () => {
  it("loguje użytkownika poprawnymi danymi i zamyka modal", async () => {
    mockedLogin.mockResolvedValue(user);
    const onClose = vi.fn();
    renderModal("login", onClose);

    fillEmail("test@example.com");
    fireEvent.change(
      document.querySelector('input[type="password"]') as HTMLInputElement,
      { target: { value: STRONG_PASSWORD } }
    );

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith(
        "test@example.com",
        STRONG_PASSWORD
      )
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("pokazuje błąd przy błędnych danych logowania", async () => {
    mockedLogin.mockRejectedValue({
      response: { data: { detail: "Invalid email or password" } },
    });
    renderModal("login");

    fillEmail("test@example.com");
    fireEvent.change(
      document.querySelector('input[type="password"]') as HTMLInputElement,
      { target: { value: "WrongPass1!" } }
    );

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid email or password")
    ).toBeInTheDocument();
  });
});
