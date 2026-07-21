import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "../ui/LanguageSwitch";

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export function Header() {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Logo>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h1>{t("app.title")}</h1>
      </Logo>
      <Controls>
        <LanguageSwitch />
        <ThemeToggle />
      </Controls>
    </HeaderContainer>
  );
}
