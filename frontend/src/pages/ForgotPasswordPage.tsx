import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthLayout } from "../components/auth/AuthLayout";
import {
  Form,
  Field,
  Label,
  Input,
  Button,
  TextButton,
  ErrorMessage,
  SuccessMessage,
} from "../components/auth/AuthForm";
import { forgotPassword } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { isAxiosError } from "axios";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || t("forgotPassword.error"));
      } else {
        setError(t("forgotPassword.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("forgotPassword.title", "Reset password")}
      subtitle={t(
        "forgotPassword.subtitle",
        "Enter your email to receive a reset link"
      )}
    >
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            {t("forgotPassword.success", "If the email exists, a reset link has been sent.")}
          </SuccessMessage>
        )}
        <Field>
          <Label>{t("login.email", "Email")}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>
        <Button type="submit" disabled={submitting}>
          {t("forgotPassword.submit", "Send reset link")}
        </Button>
        <TextButton
          type="button"
          onClick={() => {
            navigate("/");
            openLoginModal();
          }}
        >
          {t("forgotPassword.back", "Back to login")}
        </TextButton>
      </Form>
    </AuthLayout>
  );
}
