import { useTranslation } from "react-i18next";
import { TileWrapper } from "./TileWrapper";
import { IndexTableBody } from "../analytics/IndexTableBody";

export function IndexTableTile() {
  const { t } = useTranslation();

  return (
    <TileWrapper title={t("dashboard.tiles.indexTable")} titleLink="/analytics/exchanges">
      <IndexTableBody />
    </TileWrapper>
  );
}
