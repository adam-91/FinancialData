import { useTranslation } from "react-i18next";
import { TileWrapper } from "./TileWrapper";
import { StockTableBody } from "../analytics/StockTableBody";

export function StockTableTile() {
  const { t } = useTranslation();

  return (
    <TileWrapper title={t("dashboard.tiles.stockTable")} titleLink="/analytics/companies">
      <StockTableBody />
    </TileWrapper>
  );
}
