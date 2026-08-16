import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import * as preferencesApi from "../api/preferences";

const STORAGE_KEY = "app-settings";

interface SettingsState {
  defaultExchange: string | null;
  defaultCurrencies: string[];
}

interface SettingsContextType extends SettingsState {
  loading: boolean;
  version: number;
  setDefaultExchange: (value: string | null) => void;
  setDefaultCurrencies: (value: string[]) => void;
}

const DEFAULT_STATE: SettingsState = {
  defaultExchange: null,
  defaultCurrencies: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

function loadFromStorage(): SettingsState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        defaultExchange: parsed.defaultExchange ?? null,
        defaultCurrencies: Array.isArray(parsed.defaultCurrencies)
          ? parsed.defaultCurrencies
          : [],
      };
    }
  } catch {
    /* ignore malformed storage */
  }
  return DEFAULT_STATE;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [defaultExchange, setDefaultExchangeState] = useState<string | null>(
    DEFAULT_STATE.defaultExchange
  );
  const [defaultCurrencies, setDefaultCurrenciesState] = useState<string[]>(
    DEFAULT_STATE.defaultCurrencies
  );
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const applyState = (state: SettingsState) => {
      setDefaultExchangeState(state.defaultExchange);
      setDefaultCurrenciesState(state.defaultCurrencies);
      setVersion((v) => v + 1);
    };

    setLoading(true);

    if (user) {
      preferencesApi
        .getPreferences()
        .then((prefs) => {
          if (!cancelled) {
            applyState({
              defaultExchange: prefs.default_exchange,
              defaultCurrencies: prefs.default_currencies ?? [],
            });
          }
        })
        .catch(() => {
          if (!cancelled) applyState(loadFromStorage());
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      applyState(loadFromStorage());
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = useCallback(
    (state: SettingsState) => {
      if (user) {
        preferencesApi
          .updatePreferences({
            default_exchange: state.defaultExchange,
            default_currencies: state.defaultCurrencies,
          })
          .catch(() => {});
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    },
    [user]
  );

  const setDefaultExchange = (value: string | null) => {
    setDefaultExchangeState(value);
    persist({ defaultExchange: value, defaultCurrencies });
  };

  const setDefaultCurrencies = (value: string[]) => {
    setDefaultCurrenciesState(value);
    persist({ defaultExchange, defaultCurrencies: value });
  };

  return (
    <SettingsContext.Provider
      value={{
        defaultExchange,
        defaultCurrencies,
        loading,
        version,
        setDefaultExchange,
        setDefaultCurrencies,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
