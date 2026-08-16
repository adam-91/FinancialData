import { useMemo, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useIndices } from "../../hooks/useIndices";
import { useCurrencies } from "../../hooks/useCurrency";
import { MultiSelect } from "./MultiSelect";

const Wrapper = styled.div`
  position: relative;
`;

const GearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Dropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

const Title = styled.p`
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ChangePasswordButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
  }
`;

interface SettingsMenuProps {
  onOpenChangePassword: () => void;
}

export function SettingsMenu({ onOpenChangePassword }: SettingsMenuProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    defaultExchange,
    defaultCurrencies,
    setDefaultExchange,
    setDefaultCurrencies,
  } = useSettings();
  const { data: indices } = useIndices();
  const { data: currencies } = useCurrencies();
  const [open, setOpen] = useState(false);

  const exchangeOptions = useMemo(() => {
    const values = new Set<string>();
    (indices ?? []).forEach((i) => values.add(i.stock_exchange));
    return Array.from(values).sort();
  }, [indices]);

  const currencyOptions = useMemo(() => {
    return (currencies ?? []).map((c) => ({
      value: c.code,
      label: `${c.code} - ${c.name}`,
    }));
  }, [currencies]);

  return (
    <Wrapper
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <GearButton
        aria-label="Settings"
        onClick={() => setOpen((o) => !o)}
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </GearButton>
      <Dropdown $open={open}>
        <Title>{t("settings.title")}</Title>

        {user && (
          <Field>
            <ChangePasswordButton onClick={onOpenChangePassword}>
              {t("auth.changePassword")}
            </ChangePasswordButton>
          </Field>
        )}

        <Field>
          <Label>{t("settings.defaultExchange")}</Label>
          <Select
            value={defaultExchange ?? ""}
            onChange={(e) =>
              setDefaultExchange(e.target.value || null)
            }
          >
            <option value="">{t("settings.defaultExchangeNone")}</option>
            {exchangeOptions.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </Select>
        </Field>

        <Field>
          <Label>{t("settings.defaultCurrencies")}</Label>
          <MultiSelect
            options={currencyOptions}
            selected={defaultCurrencies}
            onChange={(s) => setDefaultCurrencies(s)}
            placeholder={t("currency.selectCurrencies")}
          />
        </Field>
      </Dropdown>
    </Wrapper>
  );
}
