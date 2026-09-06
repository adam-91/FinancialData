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
} from "../components/auth/AuthForm";
import { useAuth } from "../contexts/AuthContext";
import { isAxiosError } from "axios";

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changePassword, logout } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next !== confirm) {
      setError(t("changePassword.mismatch", "Passwords do not match"));
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(current, next);
      navigate("/admin");
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.detail || t("changePassword.error"));
      } else {
        setError(t("changePassword.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t("changePassword.title", "Change password")}
      subtitle={t(
        "changePassword.forced",
        "You must change your password before continuing"
      )}
    >
      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Field>
          <Label>{t("changePassword.current", "Current password")}</Label>
          <Input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field>
          <Label>{t("changePassword.new", "New password")}</Label>
          <Input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
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
        <Button type="submit" disabled={submitting}>
          {t("changePassword.submit", "Change password")}
        </Button>
        <TextButton
          type="button"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          {t("changePassword.logout", "Log out")}
        </TextButton>
      </Form>
    </AuthLayout>
  );
}
