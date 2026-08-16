import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
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

const Message = styled.p<{ $error?: boolean }>`
  margin: 12px 0 0 0;
  font-size: 13px;
  text-align: center;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`;

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!isPasswordValid(newPassword)) {
      setError(t("auth.errors.weakPassword"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.errors.passwordsMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setMessage(t("auth.errors.changeSuccess"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const detail = axiosError.response?.data?.detail;
      if (detail === "Current password is incorrect") {
        setError(t("auth.errors.wrongPassword"));
      } else {
        setError(t("auth.errors.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{t("auth.changePassword")}</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t("auth.currentPassword")}</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormGroup>
          <FormGroup>
            <Label>{t("auth.newPassword")}</Label>
            <PasswordField
              value={newPassword}
              onChange={setNewPassword}
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
              {t("auth.changePassword")}
            </Button>
          </ButtonGroup>
        </form>
        {message && <Message>{message}</Message>}
        {error && <Message $error>{error}</Message>}
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
