import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { DashboardGrid } from "./components/dashboard/DashboardGrid";
import { IndexChartTile } from "./components/dashboard/IndexChartTile";
import { CurrencyChartTile } from "./components/dashboard/CurrencyChartTile";
import { IndexTableTile } from "./components/dashboard/IndexTableTile";
import { CurrencyTableTile } from "./components/dashboard/CurrencyTableTile";
import { StockChartTile } from "./components/dashboard/StockChartTile";
import { StockTableTile } from "./components/dashboard/StockTableTile";
import { HealthcheckPage } from "./pages/HealthcheckPage";
import { RawDataPage } from "./pages/RawDataPage";
import { LogsPage } from "./pages/LogsPage";
import { AnalyticsExchangesPage } from "./pages/AnalyticsExchangesPage";
import { AnalyticsCurrenciesPage } from "./pages/AnalyticsCurrenciesPage";
import { AnalyticsCompaniesPage } from "./pages/AnalyticsCompaniesPage";

function DashboardPage() {
  return (
    <DashboardGrid>
      {{
        indexChart: <IndexChartTile />,
        currencyChart: <CurrencyChartTile />,
        indexTable: <IndexTableTile />,
        currencyTable: <CurrencyTableTile />,
        stockChart: <StockChartTile />,
        stockTable: <StockTableTile />,
      }}
    </DashboardGrid>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/healthcheck" element={<HealthcheckPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/raw-data/:entityType/:symbol" element={<RawDataPage />} />
        <Route path="/analytics/exchanges" element={<AnalyticsExchangesPage />} />
        <Route path="/analytics/currencies" element={<AnalyticsCurrenciesPage />} />
        <Route path="/analytics/companies" element={<AnalyticsCompaniesPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
