import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import { ChangePasswordModal } from "../../../components/ui/ChangePasswordModal";
import * as authApi from "../../../api/auth";

vi.mock("../../../api/auth", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

const mockedChangePassword = vi.mocked(authApi.changePassword);

const OLD_PASSWORD = "OldStrongPass1!";
const NEW_PASSWORD = "NewStrongPass1!";

function fillPasswordInput(index: number, value: string) {
  const inputs = document.querySelectorAll('input[type="password"]');
  fireEvent.change(inputs[index] as HTMLInputElement, { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChangePasswordModal", () => {
  it("zmienia hasło przy poprawnych danych", async () => {
    mockedChangePassword.mockResolvedValue(undefined);
    render(<ChangePasswordModal onClose={() => {}} />);

    fillPasswordInput(0, OLD_PASSWORD);
    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: NEW_PASSWORD },
    });
    fillPasswordInput(2, NEW_PASSWORD);

    fireEvent.click(
      screen.getByRole("button", { name: "Change password" })
    );

    await waitFor(() =>
      expect(mockedChangePassword).toHaveBeenCalledWith(
        OLD_PASSWORD,
        NEW_PASSWORD
      )
    );
    expect(await screen.findByText("Password changed.")).toBeInTheDocument();
  });

  it("pokazuje błąd przy błędnym obecnym haśle", async () => {
    mockedChangePassword.mockRejectedValue({
      response: { data: { detail: "Current password is incorrect" } },
    });
    render(<ChangePasswordModal onClose={() => {}} />);

    fillPasswordInput(0, "WrongOldPass1!");
    fireEvent.change(screen.getByPlaceholderText("New password"), {
      target: { value: NEW_PASSWORD },
    });
    fillPasswordInput(2, NEW_PASSWORD);

    fireEvent.click(
      screen.getByRole("button", { name: "Change password" })
    );

    expect(
      await screen.findByText("Current password is incorrect")
    ).toBeInTheDocument();
  });
});
