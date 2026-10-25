import React, { useCallback, useRef, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  Line,
  Path,
  Pattern,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const IVORY = "#F5F2E9";
const GOLD = "#C1A267";

export type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
export type PatternKind =
  "girih" | "mashrabiya" | "rubElHizb" | "pinwheel" | "none";

let __pb = 0;
function useUid() {
  const r = useRef<string>("");
  if (!r.current) r.current = `pb${++__pb}`;
  return r.current;
}

type Props = {
  baseColor?: string;
  ornamentColor?: string;
  corners?: Corner[];
  spread?: number;
  tileSize?: number;
  intensity?: number;
  pattern?: PatternKind; // ← the magic prop
  patternOpacity?: number;
  patternTile?: number;
  patternColor?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// ─────────────────────────────────────────────────────────────
//  PATTERN DEFINITIONS (each fully tessellates on a square tile)
// ─────────────────────────────────────────────────────────────
function renderBodyPattern(
  kind: PatternKind,
  id: string,
  size: number,
  color: string,
) {
  const c = size / 2; // tile center
  const s = size; // tile side

  switch (kind) {
    // ── 1 · GIRIH STAR — classic star & cross tessellation
    case "girih": {
      const star = 22; // star square side
      const starHalf = star / 2;
      const off = c - starHalf;
      return (
        <Pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          <G
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Rect x={off} y={off} width={star} height={star} strokeWidth={1} />
            <Rect
              x={off}
              y={off}
              width={star}
              height={star}
              strokeWidth={1}
              transform={`rotate(45 ${c} ${c})`}
            />
            <Line x1={c} y1={0} x2={c} y2={off} strokeWidth={0.6} />
            <Line x1={c} y1={off + star} x2={c} y2={s} strokeWidth={0.6} />
            <Line x1={0} y1={c} x2={off} y2={c} strokeWidth={0.6} />
            <Line x1={off + star} y1={c} x2={s} y2={c} strokeWidth={0.6} />
            <Line x1={0} y1={0} x2={off} y2={off} strokeWidth={0.5} />
            <Line x1={s} y1={0} x2={off + star} y2={off} strokeWidth={0.5} />
            <Line x1={0} y1={s} x2={off} y2={off + star} strokeWidth={0.5} />
            <Line
              x1={s}
              y1={s}
              x2={off + star}
              y2={off + star}
              strokeWidth={0.5}
            />
          </G>
        </Pattern>
      );
    }

    // ── 2 · MASHRABIYA — octagon + star lattice (wooden screen)
    case "mashrabiya": {
      const R = s * 0.375; // octagon circumradius
      const k = R / Math.SQRT2;
      const oct = [
        [c, c - R],
        [c + k, c - k],
        [c + R, c],
        [c + k, c + k],
        [c, c + R],
        [c - k, c + k],
        [c - R, c],
        [c - k, c - k],
      ]
        .map((p) => p.join(","))
        .join(" ");

      const star = s * 0.22;
      const sh = star / 2;
      const off = c - sh;

      const edgeHalf = s * 0.11; // half-octagon size
      const eh = edgeHalf;

      return (
        <Pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          <G
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Polygon points={oct} strokeWidth={0.8} />
            <Rect
              x={off}
              y={off}
              width={star}
              height={star}
              strokeWidth={0.7}
            />
            <Rect
              x={off}
              y={off}
              width={star}
              height={star}
              strokeWidth={0.7}
              transform={`rotate(45 ${c} ${c})`}
            />

            {/* Half-octagons at tile edges — complete with neighbours */}
            <Polygon
              points={`${c - eh},0 ${c + eh},0 ${c + eh * 1.4},${eh * 0.4} ${c + eh},${eh * 0.8} ${c - eh},${eh * 0.8} ${c - eh * 1.4},${eh * 0.4}`}
              strokeWidth={0.6}
            />
            <Polygon
              points={`${c - eh},${s} ${c + eh},${s} ${c + eh * 1.4},${s - eh * 0.4} ${c + eh},${s - eh * 0.8} ${c - eh},${s - eh * 0.8} ${c - eh * 1.4},${s - eh * 0.4}`}
              strokeWidth={0.6}
            />
            <Polygon
              points={`0,${c - eh} 0,${c + eh} ${eh * 0.4},${c + eh * 1.4} ${eh * 0.8},${c + eh} ${eh * 0.8},${c - eh} ${eh * 0.4},${c - eh * 1.4}`}
              strokeWidth={0.6}
            />
            <Polygon
              points={`${s},${c - eh} ${s},${c + eh} ${s - eh * 0.4},${c + eh * 1.4} ${s - eh * 0.8},${c + eh} ${s - eh * 0.8},${c - eh} ${s - eh * 0.4},${c - eh * 1.4}`}
              strokeWidth={0.6}
            />
          </G>
        </Pattern>
      );
    }

    // ── 3 · RUB EL HIZB — minimalist 8-point star
    case "rubElHizb": {
      const star = s * 0.55;
      const off = (s - star) / 2;
      return (
        <Pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          <G
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Rect x={off} y={off} width={star} height={star} strokeWidth={1} />
            <Rect
              x={off}
              y={off}
              width={star}
              height={star}
              strokeWidth={1}
              transform={`rotate(45 ${c} ${c})`}
            />
            <Circle cx={c} cy={c} r={s * 0.05} fill={color} stroke="none" />
          </G>
        </Pattern>
      );
    }

    // ── 4 · PINWHEEL — 8 rotational petals (Alhambra feel)
    case "pinwheel": {
      const petals = Array.from({ length: 8 }).map((_, i) => {
        // kite: tip at top, wide shoulder at 60% out, narrow base at center
        const pts = `${c},${c - s * 0.42} ${c + s * 0.09},${c - s * 0.12} ${c},${c} ${c - s * 0.09},${c - s * 0.12}`;
        return (
          <Polygon
            key={i}
            points={pts}
            strokeWidth={0.6}
            transform={`rotate(${i * 45} ${c} ${c})`}
          />
        );
      });
      return (
        <Pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
          <G
            stroke={color}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {petals}
            <Circle cx={c} cy={c} r={s * 0.05} strokeWidth={0.8} />
            <Circle
              cx={c}
              cy={c}
              r={s * 0.48}
              strokeWidth={0.4}
              opacity={0.6}
            />
          </G>
        </Pattern>
      );
    }

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
export default function PaperBackground({
  baseColor = IVORY,
  ornamentColor = GOLD,
  corners = ["topLeft", "bottomRight"],
  spread = 1,
  tileSize = 40,
  intensity = 0.9,
  pattern = "girih",
  patternOpacity = 0.09,
  patternTile = 90,
  patternColor,
  children,
  style,
}: Props) {
  const uid = useUid();
  const pColor = patternColor ?? ornamentColor;

  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const dimsRef = useRef({ w: 0, h: 0 });

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      if (!width || !height) return;
      if (dimsRef.current.w === width && dimsRef.current.h === height) return;
      dimsRef.current = { w: width, h: height };
      setDims({ w: width, h: height });
    },
    [],
  );

  const w = dims?.w ?? 400;
  const h = dims?.h ?? 200;
  const R = Math.min(w, h) * 0.55 * spread;

  const ts = tileSize;
  const tsHalf = ts / 2;
  const tsStarHalf = ts * 0.25;
  const tsStarSize = ts * 0.5;

  const cornerGeom = (corner: Corner) => {
    switch (corner) {
      case "topLeft":
        return {
          clip: `M 0 0 L ${R} 0 A ${R} ${R} 0 0 1 0 ${R} Z`,
          rect: { x: 0, y: 0, w: R, h: R },
          grad: { cx: 0, cy: 0, r: R },
        };
      case "topRight":
        return {
          clip: `M ${w} 0 L ${w - R} 0 A ${R} ${R} 0 0 0 ${w} ${R} Z`,
          rect: { x: w - R, y: 0, w: R, h: R },
          grad: { cx: w, cy: 0, r: R },
        };
      case "bottomLeft":
        return {
          clip: `M 0 ${h} L 0 ${h - R} A ${R} ${R} 0 0 1 ${R} ${h} Z`,
          rect: { x: 0, y: h - R, w: R, h: R },
          grad: { cx: 0, cy: h, r: R },
        };
      case "bottomRight":
        return {
          clip: `M ${w} ${h} L ${w - R} ${h} A ${R} ${R} 0 0 1 ${w} ${h - R} Z`,
          rect: { x: w - R, y: h - R, w: R, h: R },
          grad: { cx: w, cy: h, r: R },
        };
    }
  };

  return (
    <View
      style={[{ position: "relative", overflow: "hidden" }, style]}
      onLayout={handleLayout}
    >
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          {/* Dense corner tile (always khatam) */}
          <Pattern
            id={`${uid}_corner`}
            x="0"
            y="0"
            width={ts}
            height={ts}
            patternUnits="userSpaceOnUse"
          >
            <G
              stroke={ornamentColor}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={intensity}
            >
              <Rect
                x={tsHalf - tsStarHalf}
                y={tsHalf - tsStarHalf}
                width={tsStarSize}
                height={tsStarSize}
                strokeWidth={1.2}
              />
              <Rect
                x={tsHalf - tsStarHalf}
                y={tsHalf - tsStarHalf}
                width={tsStarSize}
                height={tsStarSize}
                strokeWidth={1.2}
                transform={`rotate(45 ${tsHalf} ${tsHalf})`}
              />
              <Line
                x1={tsHalf}
                y1={0}
                x2={tsHalf}
                y2={tsHalf - tsStarHalf}
                strokeWidth={1}
              />
              <Line
                x1={tsHalf}
                y1={tsHalf + tsStarHalf}
                x2={tsHalf}
                y2={ts}
                strokeWidth={1}
              />
              <Line
                x1={0}
                y1={tsHalf}
                x2={tsHalf - tsStarHalf}
                y2={tsHalf}
                strokeWidth={1}
              />
              <Line
                x1={tsHalf + tsStarHalf}
                y1={tsHalf}
                x2={ts}
                y2={tsHalf}
                strokeWidth={1}
              />
              <Line
                x1={0}
                y1={0}
                x2={tsHalf - tsStarHalf}
                y2={tsHalf - tsStarHalf}
                strokeWidth={0.8}
              />
              <Line
                x1={ts}
                y1={0}
                x2={tsHalf + tsStarHalf}
                y2={tsHalf - tsStarHalf}
                strokeWidth={0.8}
              />
              <Line
                x1={0}
                y1={ts}
                x2={tsHalf - tsStarHalf}
                y2={tsHalf + tsStarHalf}
                strokeWidth={0.8}
              />
              <Line
                x1={ts}
                y1={ts}
                x2={tsHalf + tsStarHalf}
                y2={tsHalf + tsStarHalf}
                strokeWidth={0.8}
              />
            </G>
          </Pattern>

          {/* Body pattern — whichever the caller picks */}
          {renderBodyPattern(pattern, `${uid}_body`, patternTile, pColor)}

          {/* Corner clips + fades */}
          {corners.map((corner) => {
            const g = cornerGeom(corner);
            return (
              <React.Fragment key={corner}>
                <ClipPath id={`${uid}_clip_${corner}`}>
                  <Path d={g.clip} />
                </ClipPath>
                <RadialGradient
                  id={`${uid}_fade_${corner}`}
                  gradientUnits="userSpaceOnUse"
                  cx={g.grad.cx}
                  cy={g.grad.cy}
                  r={g.grad.r}
                >
                  <Stop offset="0%" stopColor={baseColor} stopOpacity="0" />
                  <Stop offset="55%" stopColor={baseColor} stopOpacity="0.4" />
                  <Stop offset="90%" stopColor={baseColor} stopOpacity="0.95" />
                  <Stop offset="100%" stopColor={baseColor} stopOpacity="1" />
                </RadialGradient>
              </React.Fragment>
            );
          })}
        </Defs>

        <Rect width="100%" height="100%" fill={baseColor} />

        {/* Body pattern */}
        {pattern !== "none" && (
          <Rect
            width="100%"
            height="100%"
            fill={`url(#${uid}_body)`}
            opacity={patternOpacity}
          />
        )}

        {/* Corner medallions */}
        {corners.map((corner) => {
          const g = cornerGeom(corner);
          return (
            <React.Fragment key={corner}>
              <G clipPath={`url(#${uid}_clip_${corner})`}>
                <Rect
                  x={g.rect.x}
                  y={g.rect.y}
                  width={g.rect.w}
                  height={g.rect.h}
                  fill={`url(#${uid}_corner)`}
                />
              </G>
              <Rect
                x={g.rect.x}
                y={g.rect.y}
                width={g.rect.w}
                height={g.rect.h}
                fill={`url(#${uid}_fade_${corner})`}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {children}
    </View>
  );
}
