import { useQuery } from "@tanstack/react-query";
import { getCurrencies} from "../api/currency";

export const useCurrencies = () => {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: getCurrencies,
  });
};

