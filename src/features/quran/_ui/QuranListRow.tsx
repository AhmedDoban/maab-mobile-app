import ContentColumn from "@/components/ui/ContentColumn";
import { memo } from "react";
import type { QuranRow } from "../_data/quranRows";
import JuzHeader from "./JuzHeader";
import SurahRow from "./SurahRow";

export default memo(function QuranListRow({
  row,
  first,
}: {
  row: QuranRow;
  first: boolean;
}) {
  if (row.kind === "surah") {
    return (
      <ContentColumn className="px-4">
        <SurahRow surah={row.surah} />
      </ContentColumn>
    );
  }
  return (
    <ContentColumn className={first ? "px-4" : "px-4 pt-2.5"}>
      <JuzHeader group={row.group} />
    </ContentColumn>
  );
});
