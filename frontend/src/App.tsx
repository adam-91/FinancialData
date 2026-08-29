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
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { AdminPage } from "./pages/AdminPage";
import { RequireAuth, GuestOnly } from "./components/auth/RequireAuth";
import { LoginModal } from "./components/ui/LoginModal";
import { useAuth } from "./contexts/AuthContext";

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
  const { isLoginModalOpen } = useAuth();

  return (
    <>
      <Routes>
        <Route
          path="/forgot-password"
          element={
            <GuestOnly>
              <ForgotPasswordPage />
            </GuestOnly>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/change-password"
          element={
            <RequireAuth>
              <ChangePasswordPage />
            </RequireAuth>
          }
        />

        <Route
          path="/"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/healthcheck"
          element={
            <Layout>
              <HealthcheckPage />
            </Layout>
          }
        />
        <Route
          path="/logs"
          element={
            <Layout>
              <LogsPage />
            </Layout>
          }
        />
        <Route
          path="/raw-data/:entityType/:symbol"
          element={
            <Layout>
              <RawDataPage />
            </Layout>
          }
        />
        <Route
          path="/analytics/exchanges"
          element={
            <Layout>
              <AnalyticsExchangesPage />
            </Layout>
          }
        />
        <Route
          path="/analytics/currencies"
          element={
            <Layout>
              <AnalyticsCurrenciesPage />
            </Layout>
          }
        />
        <Route
          path="/analytics/companies"
          element={
            <Layout>
              <AnalyticsCompaniesPage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Layout>
                <AdminPage />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
      {isLoginModalOpen && <LoginModal />}
    </>
  );
}

export default App;
