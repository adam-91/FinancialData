import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { StockIndex } from "../../types/index";

const ControlsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
`;

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const Select = styled.select`
  padding: 8px 32px 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  min-width: 200px;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  font-size: 13px;
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

export type ChartType = "candlestick" | "line";

interface ChartControlsProps {
  indices: StockIndex[];
  selectedSymbol: string;
  chartType: ChartType;
  onSymbolChange: (symbol: string) => void;
  onChartTypeChange: (type: ChartType) => void;
}

export function ChartControls({
  indices,
  selectedSymbol,
  chartType,
  onSymbolChange,
  onChartTypeChange,
}: ChartControlsProps) {
  const { t } = useTranslation();

  return (
    <ControlsContainer>
      <SelectWrapper>
        <label>{t("chart.selectIndex")}</label>
        <Select value={selectedSymbol} onChange={(e) => onSymbolChange(e.target.value)}>
          {indices.map((index) => (
            <option key={index.symbol} value={index.symbol}>
              {index.name} ({index.stock_exchange})
            </option>
          ))}
        </Select>
      </SelectWrapper>
      <SelectWrapper>
        <label>{t("chart.chartType")}</label>
        <ToggleGroup>
          <ToggleButton
            $active={chartType === "candlestick"}
            onClick={() => onChartTypeChange("candlestick")}
          >
            {t("chart.candlestick")}
          </ToggleButton>
          <ToggleButton
            $active={chartType === "line"}
            onClick={() => onChartTypeChange("line")}
          >
            {t("chart.line")}
          </ToggleButton>
        </ToggleGroup>
      </SelectWrapper>
    </ControlsContainer>
  );
}
