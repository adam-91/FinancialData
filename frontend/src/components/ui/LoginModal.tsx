import styled from "styled-components";
import { useTranslation } from "react-i18next";

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
  max-width: 400px;
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
`;

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>{t("login.title", "Login")}</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t("login.username", "Username")}</Label>
            <Input type="text" />
          </FormGroup>
          <FormGroup>
            <Label>{t("login.password", "Password")}</Label>
            <Input type="password" />
          </FormGroup>
          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onClose}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" $variant="primary">
              {t("login.submit", "Login")}
            </Button>
          </ButtonGroup>
        </form>
      </ModalContainer>
    </Overlay>
  );
}
