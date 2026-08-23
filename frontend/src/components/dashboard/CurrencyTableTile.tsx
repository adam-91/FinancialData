import { useTranslation } from "react-i18next";
import { TileWrapper } from "./TileWrapper";
import { CurrencyTableBody } from "../analytics/CurrencyTableBody";

export function CurrencyTableTile() {
  const { t } = useTranslation();

  return (
    <TileWrapper title={t("dashboard.tiles.currencyTable")} titleLink="/analytics/currencies">
      <CurrencyTableBody />
    </TileWrapper>
  );
}
