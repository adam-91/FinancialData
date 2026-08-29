import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitch } from "../ui/LanguageSwitch";
import { AnalyticsMenu } from "./AnalyticsMenu";
import { useAuth } from "../../contexts/AuthContext";

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

const Nav = styled.nav`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    justify-content: center;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  color: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.text.secondary};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceHover : "transparent"};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LoginButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
  }
`;

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, openLoginModal } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/");
  };

  return (
    <HeaderContainer>
      <Logo>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h1>{t("app.title")}</h1>
      </Logo>
      <Nav>
        <NavLink to="/" $active={location.pathname === "/"}>
          {t("nav.dashboard", "Dashboard")}
        </NavLink>
        <AnalyticsMenu />
        <NavLink to="/healthcheck" $active={location.pathname === "/healthcheck"}>
          {t("nav.healthcheck", "Healthcheck")}
        </NavLink>
        <NavLink to="/logs" $active={location.pathname === "/logs"}>
          {t("nav.logs", "Logs")}
        </NavLink>
        {user && (
          <NavLink to="/admin" $active={location.pathname === "/admin"}>
            {t("nav.admin", "Admin")}
          </NavLink>
        )}
      </Nav>
      <Controls>
        {user ? (
          <LoginButton onClick={handleLogout} disabled={loggingOut}>
            {t("nav.logout", "Logout")}
          </LoginButton>
        ) : (
          <LoginButton onClick={openLoginModal}>
            {t("nav.login", "Login")}
          </LoginButton>
        )}
        <LanguageSwitch />
        <ThemeToggle />
      </Controls>
    </HeaderContainer>
  );
}
