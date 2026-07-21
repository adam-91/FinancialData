import { Layout } from "./components/layout/Layout";
import { ChartSection } from "./components/chart/ChartSection";
import { CurrencySection } from "./components/tables/CurrencySection";
import { StockSection } from "./components/tables/StockSection";

function App() {
  return (
    <Layout>
      <ChartSection />
      <CurrencySection />
      <StockSection />
    </Layout>
  );
}

export default App;
