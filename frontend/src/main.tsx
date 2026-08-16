import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import "./i18n";
import App from "./App";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <AuthProvider>
            <SettingsProvider>
              <GlobalStyles />
              <App />
            </SettingsProvider>
          </AuthProvider>
        </ThemeContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
