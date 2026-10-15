import ContentColumn from "@/components/ui/ContentColumn";
import { memo } from "react";
import { LocalHadith } from "../_data";
import LocalHadithCard from "./LocalHadithCard";

export default memo(function HadithListItem({
  hadith,
}: {
  hadith: LocalHadith;
}) {
  return (
    <ContentColumn className="px-4">
      <LocalHadithCard hadith={hadith} />
    </ContentColumn>
  );
});
