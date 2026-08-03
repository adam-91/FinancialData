import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { Period } from "../../types/index";

const PERIODS: Period[] = ["1w", "3m", "1y", "3y", "10y", "max"];

const ToggleGroup = styled.div`
  display: flex;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active, theme }) => ($active ? theme.colors.accent : theme.colors.surface)};
  color: ${({ $active, theme }) => ($active ? "#fff" : theme.colors.text.secondary)};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.accentHover : theme.colors.surfaceHover)};
  }

  &:not(:last-child) {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const { t } = useTranslation();

  return (
    <ToggleGroup>
      {PERIODS.map((period) => (
        <ToggleButton
          key={period}
          $active={selectedPeriod === period}
          onClick={() => onPeriodChange(period)}
        >
          {t(`period.${period}`)}
        </ToggleButton>
      ))}
    </ToggleGroup>
  );
}
