import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "../../../contexts/AuthContext";
import { LoginModal } from "../../../components/ui/LoginModal";

vi.mock("../../api/auth", () => ({
  login: vi.fn().mockResolvedValue({
    id: 1,
    email: "admin@example.com",
    must_change_password: false,
    is_active: true,
    created_at: "2026-01-01T00:00:00",
  }),
  logout: vi.fn(),
  fetchMe: vi.fn().mockRejectedValue(new Error("unauthorized")),
  changePassword: vi.fn(),
}));

function Opener() {
  const { openLoginModal } = useAuth();
  return <button onClick={openLoginModal}>open</button>;
}

function ModalHost() {
  const { isLoginModalOpen } = useAuth();
  return isLoginModalOpen ? <LoginModal /> : null;
}

function setup() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Opener />
        <ModalHost />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("LoginModal", () => {
  it("renders email and password inputs", () => {
    const { container } = setup();
    fireEvent.click(screen.getByText("open"));

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeTruthy();
    expect(container.querySelector('input[type="email"]')).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it("closes when clicking the close button", async () => {
    const { container } = setup();
    fireEvent.click(screen.getByText("open"));
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Close"));
    expect(screen.queryByRole("heading", { name: /sign in/i })).toBeNull();
  });
});
