import { useState, FormEvent, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import {
  Form,
  Field,
  Label,
  Input,
  Button,
  SecondaryLink,
  ErrorMessage,
} from "../auth/AuthForm";
import { isAxiosError } from "axios";

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
  padding: 24px;
`;

const ModalContainer = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function LoginModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, closeLoginModal } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLoginModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeLoginModal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      closeLoginModal();
      setEmail("");
      setPassword("");
      if (user.must_change_password) {
        navigate("/change-password");
      } else {
        navigate("/admin");
      }
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || t("login.error"));
      } else {
        setError(t("login.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    closeLoginModal();
    navigate("/forgot-password");
  };

  return (
    <Overlay onClick={closeLoginModal}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={closeLoginModal} aria-label={t("login.close", "Close")}>
          &times;
        </CloseButton>
        <Title>{t("login.title", "Sign in")}</Title>
        <Subtitle>{t("login.subtitle", "Sign in to the admin panel")}</Subtitle>
        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Field>
            <Label>{t("login.email", "Email")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              required
            />
          </Field>
          <Field>
            <Label>{t("login.password", "Password")}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          <Button type="submit" disabled={submitting}>
            {t("login.submit", "Login")}
          </Button>
          <SecondaryLink
            to="/forgot-password"
            onClick={handleForgotPassword}
          >
            {t("login.forgotPassword", "Forgot password?")}
          </SecondaryLink>
        </Form>
      </ModalContainer>
    </Overlay>
  );
}
