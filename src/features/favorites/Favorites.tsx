import ContentColumn from "@/components/ui/ContentColumn";
import { FlatList, ListRenderItem } from "react-native";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Screen from "@/components/ui/Screen";
import { Stack } from "expo-router";
import EmptyState from "@/components/ui/EmptyState";
import useDirection from "@/hooks/useDirection";
import useFavoriteRows from "./_components/useFavoriteRows";
import { FavoriteRowData } from "./_data/types";
import FavoriteRow from "./_ui/FavoriteRow";

const CONTENT_STYLE = {
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 32,
};

const keyExtractor = (row: FavoriteRowData) => row.key;

const renderRow: ListRenderItem<FavoriteRowData> = ({ item, index }) => (
  <ContentColumn>
    <FavoriteRow row={item} index={index} />
  </ContentColumn>
);

export default function Favorites() {
  const { t } = useTranslation(["common", "azkar"]);
  const { direction } = useDirection();
  const rows = useFavoriteRows();

  const style = useMemo(() => ({ direction }), [direction]);
  const options = useMemo(() => ({ title: t("tabs.favorites") }), [t]);

  if (rows.length === 0) {
    return (
      <Screen>
        <Stack.Screen options={options} />
        <EmptyState
          icon="heart"
          title={t("azkar:favoritesEmpty")}
          hint={t("azkar:favoritesHint")}
        />
      </Screen>
    );
  }

  return (
    <>
      <Stack.Screen options={options} />
      <FlatList
        className="flex-1 bg-main-bg"
        style={style}
        contentContainerStyle={CONTENT_STYLE}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        data={rows}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
        initialNumToRender={6}
        windowSize={7}
      />
    </>
  );
}
