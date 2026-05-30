import { RatesTable } from "./components/RatesTable";
import { useRates } from "./hooks/useRates";
import { useCurrencies } from "./hooks/useCurrency";
function App() {
  const {
    data: rates,
    isLoading,
    isError,
  } = useRates();

  const {
    data: currencies, 
    isLoading: currenciesLoading, 
    isError: currenciesError 
  }  = useCurrencies()

  if (isLoading) {
    
    return <h2>Ładowanie...</h2>;
  }

  if (isError) {
    return <h2>Błąd pobierania danych</h2>;
  }

  return (
    <main>
      <h1>Kursy walut NBP</h1>

      <RatesTable currencies={currencies  ?? []} rates={rates ?? []} />
    </main>
  );
}

export default App;