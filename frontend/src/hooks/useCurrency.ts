import { useQuery } from "@tanstack/react-query";
import { getCurrency, getCurrencies} from "../api/currency";

export const useCurrency = () => {
  return useQuery({
    queryKey: ["currency"],
    queryFn: getCurrency,
  });
};

export const useCurrencies = () => {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });
};

