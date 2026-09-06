import { useState, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { resetPassword } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import { isAxiosError } from "axios";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openLoginModal } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("changePassword.mismatch", "Passwords do not match"));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
        openLoginModal();
      }, 2000);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || t("resetPassword.error"));
      } else {
        setError(t("resetPassword.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("resetPassword.title", "Set new password")}
      subtitle={t("resetPassword.subtitle", "Choose a new password")}
    >
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            {t("resetPassword.success", "Password updated. Redirecting to login...")}
          </SuccessMessage>
        )}
        <Field>
          <Label>{t("changePassword.new", "New password")}</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Field>
          <Label>{t("changePassword.confirm", "Confirm new password")}</Label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Button type="submit" disabled={submitting || !token}>
          {t("resetPassword.submit", "Update password")}
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
