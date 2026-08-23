import { DashboardGrid, buildDefaultLayouts } from "../components/dashboard/DashboardGrid";
import { IndexChartTile } from "../components/dashboard/IndexChartTile";
import { IndexTableTile } from "../components/dashboard/IndexTableTile";

const defaultLayouts = buildDefaultLayouts(["indexChart", "indexTable"]);

export function AnalyticsExchangesPage() {
  return (
    <DashboardGrid storageKey="analytics-exchanges-layout" defaultLayouts={defaultLayouts}>
      {{
        indexChart: <IndexChartTile />,
        indexTable: <IndexTableTile />,
      }}
    </DashboardGrid>
  );
}
