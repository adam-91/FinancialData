import { DashboardGrid, buildDefaultLayouts } from "../components/dashboard/DashboardGrid";
import { StockChartTile } from "../components/dashboard/StockChartTile";
import { StockTableTile } from "../components/dashboard/StockTableTile";

const defaultLayouts = buildDefaultLayouts(["stockChart", "stockTable"]);

export function AnalyticsCompaniesPage() {
  return (
    <DashboardGrid storageKey="analytics-companies-layout" defaultLayouts={defaultLayouts}>
      {{
        stockChart: <StockChartTile />,
        stockTable: <StockTableTile />,
      }}
    </DashboardGrid>
  );
}
