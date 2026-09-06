import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const MenuContainer = styled.div`
  position: relative;
`;

const MenuTrigger = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: none;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceHover : "transparent"};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 8px;
  z-index: 200;
`;

const DropdownPanel = styled.div`
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const DropdownLink = styled(Link)`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const ANALYTICS_SCREENS = [
  { path: "/analytics/currencies", key: "currencies" },
  { path: "/analytics/exchanges", key: "exchanges" },
  { path: "/analytics/companies", key: "companies" },
];

export function AnalyticsMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = location.pathname.startsWith("/analytics");

  return (
    <MenuContainer
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <MenuTrigger
        $active={isActive || open}
        onClick={() => setOpen(true)}
      >
        {t("nav.analytics")}
      </MenuTrigger>
      {open && (
        <Dropdown>
          <DropdownPanel>
            {ANALYTICS_SCREENS.map((screen) => (
              <DropdownLink
                key={screen.path}
                to={screen.path}
                onClick={() => setOpen(false)}
              >
                {t(`analytics.${screen.key}`)}
              </DropdownLink>
            ))}
          </DropdownPanel>
        </Dropdown>
      )}
    </MenuContainer>
  );
}
