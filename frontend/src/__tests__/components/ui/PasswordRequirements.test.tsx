import { describe, it, expect } from "vitest";
import { render } from "../../../test-utils";
import {
  PASSWORD_RULES,
  PasswordRequirements,
  isPasswordValid,
} from "../../../components/ui/PasswordRequirements";

describe("password rules", () => {
  it("accepts a password with all required characters", () => {
    expect(isPasswordValid("StrongPass1!")).toBe(true);
  });

  it.each([
    ["Short1!", "too short"],
    ["alllowercase1!", "no uppercase"],
    ["ALLUPPERCASE1!", "no lowercase"],
    ["NoDigitsHere!", "no digit"],
    ["NoSpecialChar1", "no special character"],
  ])("rejects %s (%s)", (password) => {
    expect(isPasswordValid(password)).toBe(false);
  });

  it("has five requirements", () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });
});

describe("PasswordRequirements", () => {
  it("renders one list item per requirement", () => {
    const { container } = render(<PasswordRequirements password="" />);
    expect(container.querySelectorAll("li")).toHaveLength(5);
  });
});
