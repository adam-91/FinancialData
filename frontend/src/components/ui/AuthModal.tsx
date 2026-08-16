import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import * as authApi from "../../api/auth";
import { PasswordField, isPasswordValid } from "./PasswordRequirements";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${({ theme, $variant }) =>
    $variant === "primary"
      ? `
    background: ${theme.colors.accent};
    color: white;
    &:hover {
      background: ${theme.colors.accentHover};
    }
  `
      : `
    background: ${theme.colors.surfaceHover};
    color: ${theme.colors.text.primary};
    &:hover {
      background: ${theme.colors.border};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SwitchText = styled.p`
  margin: 16px 0 0 0;
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const Message = styled.p<{ $error?: boolean }>`
  margin: 12px 0 0 0;
  font-size: 13px;
  text-align: center;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`;

type View = "login" | "register" | "forgot" | "reset";

interface AuthModalProps {
  onClose: () => void;
  initialView?: View;
  resetToken?: string;
}

export function AuthModal({
  onClose,
  initialView = "login",
  resetToken,
}: AuthModalProps) {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setMessage(null);
    setError(null);
  };

  const goTo = (next: View) => {
    resetState();
    setView(next);
  };

  const extractError = (err: unknown): string => {
    const axiosError = err as { response?: { data?: { detail?: string } } };
    const detail = axiosError.response?.data?.detail;
    if (detail) {
      if (detail === "Invalid email or password")
        return t("auth.errors.invalidCredentials");
      if (detail === "Email already registered")
        return t("auth.errors.emailExists");
      if (detail === "Invalid or expired token")
        return t("auth.errors.invalidResetToken");
    }
    return t("auth.errors.generic");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    resetState();
    setSubmitting(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    resetState();
    if (!isPasswordValid(password)) {
      setError(t("auth.errors.weakPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordsMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.register(email, password);
      setPassword("");
      setConfirmPassword("");
      setMessage(t("auth.errors.registerSuccess"));
      setView("login");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    resetState();
    setSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
      setMessage(t("auth.errors.resetSent"));
    } catch {
      setMessage(t("auth.errors.resetSent"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    resetState();
    if (!isPasswordValid(password)) {
      setError(t("auth.errors.weakPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordsMismatch"));
      return;
    }
    if (!resetToken) {
      setError(t("auth.errors.invalidResetToken"));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.resetPassword(resetToken, password);
      setMessage(t("auth.errors.resetSuccess"));
      setPassword("");
      setConfirmPassword("");
      setView("login");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<View, string> = {
    login: t("auth.loginTitle"),
    register: t("auth.registerTitle"),
    forgot: t("auth.forgotTitle"),
    reset: t("auth.resetTitle"),
  };

  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{titles[view]}</Title>

        {view === "login" && (
          <form onSubmit={handleLogin}>
            <FormGroup>
              <Label>{t("auth.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormGroup>
            <FormGroup>
              <Label>{t("auth.password")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </FormGroup>
            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose}>
                {t("auth.cancel")}
              </Button>
              <Button type="submit" $variant="primary" disabled={submitting}>
                {t("auth.login")}
              </Button>
            </ButtonGroup>
            <SwitchText>
              <LinkButton type="button" onClick={() => goTo("forgot")}>
                {t("auth.forgotPassword")}
              </LinkButton>
            </SwitchText>
            <SwitchText>
              {t("auth.noAccount")}{" "}
              <LinkButton type="button" onClick={() => goTo("register")}>
                {t("auth.register")}
              </LinkButton>
            </SwitchText>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister}>
            <FormGroup>
              <Label>{t("auth.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormGroup>
            <FormGroup>
              <Label>{t("auth.password")}</Label>
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder={t("auth.password")}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t("auth.confirmPassword")}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </FormGroup>
            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose}>
                {t("auth.cancel")}
              </Button>
              <Button type="submit" $variant="primary" disabled={submitting}>
                {t("auth.register")}
              </Button>
            </ButtonGroup>
            <SwitchText>
              {t("auth.haveAccount")}{" "}
              <LinkButton type="button" onClick={() => goTo("login")}>
                {t("auth.login")}
              </LinkButton>
            </SwitchText>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgot}>
            <FormGroup>
              <Label>{t("auth.email")}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </FormGroup>
            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={() => goTo("login")}>
                {t("auth.backToLogin")}
              </Button>
              <Button type="submit" $variant="primary" disabled={submitting}>
                {t("auth.sendResetLink")}
              </Button>
            </ButtonGroup>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleReset}>
            <FormGroup>
              <Label>{t("auth.newPassword")}</Label>
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder={t("auth.newPassword")}
              />
            </FormGroup>
            <FormGroup>
              <Label>{t("auth.confirmPassword")}</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </FormGroup>
            <ButtonGroup>
              <Button type="button" $variant="secondary" onClick={onClose}>
                {t("auth.cancel")}
              </Button>
              <Button type="submit" $variant="primary" disabled={submitting}>
                {t("auth.resetPassword")}
              </Button>
            </ButtonGroup>
          </form>
        )}

        {message && <Message>{message}</Message>}
        {error && <Message $error>{error}</Message>}
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
