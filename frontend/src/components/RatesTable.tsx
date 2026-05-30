import { ExchangeRate } from "../types/currencyExchangeRate";
import { CurrencyRate } from "../types/currencyRate";

interface RatesTableProps {
  currencies: CurrencyRate[];
  rates: ExchangeRate[];
}

export function RatesTable({currencies,
  rates,
}: RatesTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>Currency</th>
          <th>Data</th>
          <th>Mid rate</th>
          <th>Buy rate</th>
          <th>Sell rate</th>
        </tr>
      </thead>

      <tbody>
        {rates.map((rate) => {
          const code = currencies[rate.currency_id]?.code
          const currency = currencies[rate.currency_id]?.name
         return (
          <tr
            key={`${code}-${rate.effective_date}`}
          >
            <td>{code}</td>
            <td>{currency}</td>
            <td>{rate.effective_date.getDate()}</td>
            <td>{rate.mid.toFixed(4)}</td>
            <td>{rate.bid.toFixed(4)}</td>
            <td>{rate.ask.toFixed(4)}</td>
            
          </tr>
          );
        })}
      </tbody>
    </table>
  );
}