import { DashboardGrid, buildDefaultLayouts } from "../components/dashboard/DashboardGrid";
import { CurrencyChartTile } from "../components/dashboard/CurrencyChartTile";
import { CurrencyTableTile } from "../components/dashboard/CurrencyTableTile";

const defaultLayouts = buildDefaultLayouts(["currencyChart", "currencyTable"]);

export function AnalyticsCurrenciesPage() {
  return (
    <DashboardGrid storageKey="analytics-currencies-layout" defaultLayouts={defaultLayouts}>
      {{
        currencyChart: <CurrencyChartTile />,
        currencyTable: <CurrencyTableTile />,
      }}
    </DashboardGrid>
  );
}
