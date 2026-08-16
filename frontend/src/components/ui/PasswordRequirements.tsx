import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

interface PasswordRule {
  key: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", test: (p) => p.length >= 10 },
  { key: "lower", test: (p) => /[a-z]/.test(p) },
  { key: "upper", test: (p) => /[A-Z]/.test(p) },
  { key: "digit", test: (p) => /\d/.test(p) },
  { key: "special", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const isPasswordValid = (password: string): boolean =>
  PASSWORD_RULES.every((rule) => rule.test(password));

const RequirementsPopover = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const RequirementTitle = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RequirementList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RequirementItem = styled.li<{ $met: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 2px 0;
  color: ${({ $met, theme }) =>
    $met ? theme.colors.success : theme.colors.text.muted};
`;

const CheckIcon = styled.span<{ $met: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  background: ${({ $met, theme }) =>
    $met ? theme.colors.success : "transparent"};
  border: 1px solid
    ${({ $met, theme }) => ($met ? theme.colors.success : theme.colors.border)};
  color: ${({ $met }) => ($met ? "#fff" : "transparent")};
`;

const FieldWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { t } = useTranslation();

  return (
    <RequirementsPopover>
      <RequirementTitle>{t("auth.requirements.title")}</RequirementTitle>
      <RequirementList>
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <RequirementItem key={rule.key} $met={met}>
              <CheckIcon $met={met}>✓</CheckIcon>
              {t(`auth.requirements.${rule.key}`)}
            </RequirementItem>
          );
        })}
      </RequirementList>
    </RequirementsPopover>
  );
}

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PasswordField({
  value,
  onChange,
  placeholder,
}: PasswordFieldProps) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  return (
    <FieldWrapper>
      <Input
        type="password"
        value={value}
        placeholder={placeholder}
        onFocus={() => {
          setFocused(true);
          setTouched(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
      />
      {focused && touched && !isPasswordValid(value) && (
        <PasswordRequirements password={value} />
      )}
    </FieldWrapper>
  );
}
