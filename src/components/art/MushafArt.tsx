import useArtColors from "@/hooks/useArtColors";
import { memo } from "react";
import { Circle, G, Image, Rect } from "react-native-svg";
import ArtCanvas from "./ArtCanvas";
import ArtLantern from "./ArtLantern";
import ArtLeaves from "./ArtLeaves";

const COVER = require("@/assets/images/quran/cover.webp");
const OPEN = require("@/assets/images/quran/open.webp");

export default memo(function MushafArt() {
  const c = useArtColors();

  return (
    <ArtCanvas>
      <Circle cx={134} cy={104} r={76} fill={c.tint} opacity={0.07} />

      <G transform="rotate(-6 79 89)">
        <Rect
          x={42}
          y={32}
          width={76}
          height={118}
          rx={4}
          fill="#000"
          opacity={0.18}
        />
        <Image
          href={COVER}
          x={40}
          y={30}
          width={76}
          height={118}
          preserveAspectRatio="none"
        />
      </G>

      <Image
        href={OPEN}
        x={86}
        y={80}
        width={152}
        height={108}
        preserveAspectRatio="xMidYMid meet"
      />

      <ArtLantern x={236} chain={18} scale={0.7} />
      <ArtLeaves x={30} y={186} scale={1} />
    </ArtCanvas>
  );
});
