import AppText from "@/components/ui/AppText";
import { memo } from "react";
import { View } from "react-native";
import { PAGE } from "../_components/pageLayout";
import useMushafColors from "../_components/useMushafColors";
import { hizbLabel } from "../_data/hizbLabel";
import PageNumberBadge from "./PageNumberBadge";

export default memo(function MushafPageFooter({ page }: { page: number }) {
  const c = useMushafColors();
  const rightPage = page % 2 === 1;

  return (
    <View
      className={
        rightPage
          ? "flex-row items-center justify-between"
          : "flex-row-reverse items-center justify-between"
      }
      style={{ height: PAGE.bottomRow, marginTop: PAGE.gap }}
    >
      <PageNumberBadge page={page} />
      <AppText arabic className="text-xs" style={{ color: c.gold }}>
        {hizbLabel(page)}
      </AppText>
    </View>
  );
});
