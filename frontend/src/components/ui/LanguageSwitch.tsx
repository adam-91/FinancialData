import styled from "styled-components";
import { useTranslation } from "react-i18next";

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const LangButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => ($active ? theme.colors.accent : "transparent")};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text.secondary)};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.accentHover : theme.colors.surfaceHover)};
  }
`;

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <SwitchContainer>
      <LangButton
        $active={i18n.language === "pl"}
        onClick={() => changeLanguage("pl")}
      >
        PL
      </LangButton>
      <LangButton
        $active={i18n.language === "en"}
        onClick={() => changeLanguage("en")}
      >
        EN
      </LangButton>
    </SwitchContainer>
  );
}
