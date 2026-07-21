import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import "./i18n";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <GlobalStyles />
        <App />
      </ThemeContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
