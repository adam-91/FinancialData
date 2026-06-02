import { ExchangeRate } from "../types/currencyExchangeRate";
import { CurrencyRate } from "../types/currencyRate";

interface RatesTableProps {
  currencies: CurrencyRate[];
  rates: ExchangeRate[] | null;
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
        {rates?.map((rate) => {
          const code = rate.code
          //const currency = currencies.filter(c => c.code == code)

         return (
          <tr key={`${code}-${rate.effectiveDate}`} >
            <td>{code}</td>
            <td>{rate.currency}</td>
            <td>{rate.effectiveDate}</td>
            <td>{rate.mid != null ? Number(rate.mid).toFixed(4) : "-"}</td>
            <td>{rate.bid != null ? Number(rate.bid).toFixed(4) : "-"}</td>
            <td>{rate.ask != null ? Number(rate.ask).toFixed(4) : "-"}</td>
            
          </tr>
          );
        })}
      </tbody>
    </table>
  );
}