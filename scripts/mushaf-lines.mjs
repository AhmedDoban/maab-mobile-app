export const LINE_TOP = 8.4;
export const LINE_PITCH = (546 - 8.4) / 15;
export const LINE_GAP = 7;
export const LINES = 15;

const MARGIN = 6;
const NEIGHBORS = 4;
const TOKEN = /[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
const ARITY = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2 };

const round = (n) => Math.round(n * 10000) / 10000;

export const slotOf = (y) =>
  Math.min(LINES - 1, Math.max(0, Math.floor((y - LINE_TOP) / LINE_PITCH)));

export const spacedHeight = (height) => height + (LINES - 1) * LINE_GAP;

export function parseMatrix(svg) {
  const [a, , , d, e, f] = svg
    .match(/<g transform="matrix\(([^)]+)\)">/)[1]
    .split(/[\s,]+/)
    .map(Number);
  return { a, d, e, f };
}

function subpaths(d) {
  const tokens = d.match(TOKEN);
  const list = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let cmd = null;
  let current = null;
  let i = 0;

  while (i < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd !== cmd.toLowerCase()) throw new Error(`absolute ${cmd} in path`);
      if (cmd === "z") {
        current.parts.push("z");
        cx = sx;
        cy = sy;
      }
      continue;
    }
    const arity = ARITY[cmd];
    if (!arity) throw new Error(`unsupported command ${cmd}`);
    const raw = tokens.slice(i, i + arity);
    const n = raw.map(Number);
    i += arity;

    if (cmd === "m") {
      if (current) list.push(current);
      sx = cx + n[0];
      sy = cy + n[1];
      cx = sx;
      cy = sy;
      current = { x: sx, y: sy, parts: [], points: [[sx, sy]] };
      cmd = "l";
      continue;
    }

    current.parts.push(`${cmd}${raw.join(" ")}`);
    if (cmd === "h") cx += n[0];
    else if (cmd === "v") cy += n[0];
    else {
      for (let k = 0; k < arity - 2; k += 2) {
        current.points.push([cx + n[k], cy + n[k + 1]]);
      }
      cx += n[arity - 2];
      cy += n[arity - 1];
    }
    current.points.push([cx, cy]);
  }
  if (current) list.push(current);

  return list.map(({ x, y, parts, points }) => {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    return {
      d: `M${round(x)} ${round(y)}${parts.join("")}`,
      box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    };
  });
}

const toOuter = ({ a, d, e, f }, [x0, y0, x1, y1], tx, ty, scale = [1, 1]) => {
  const xs = [x0 * scale[0], x1 * scale[0]].map((x) => a * (x + tx) + e);
  const ys = [y0 * scale[1], y1 * scale[1]].map((y) => d * (y + ty) + f);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

const centerY = (box) => (box[1] + box[3]) / 2;

const gap = (p, q) =>
  Math.hypot(
    Math.max(0, p[0] - q[2], q[0] - p[2]),
    Math.max(0, p[1] - q[3], q[1] - p[3]),
  );

const inside = (p, q) =>
  p[0] >= q[0] && p[1] >= q[1] && p[2] <= q[2] && p[3] <= q[3];

function assignLines(contours) {
  const certain = contours.map(({ box }) => {
    const q = (centerY(box) - LINE_TOP) / LINE_PITCH;
    const frac = q - Math.floor(q);
    const near =
      q > 0 && q < LINES && Math.min(frac, 1 - frac) * LINE_PITCH < MARGIN;
    return near ? null : slotOf(centerY(box));
  });
  const lines = certain.slice();
  let ambiguous = 0;

  contours.forEach(({ box }, i) => {
    if (lines[i] !== null) return;
    const boundary = Math.round((centerY(box) - LINE_TOP) / LINE_PITCH);
    const candidates = [
      Math.max(0, boundary - 1),
      Math.min(LINES - 1, boundary),
    ];
    let prev = null;
    for (let j = i - 1; j >= 0 && prev === null; j--) prev = certain[j];
    let next = null;
    for (let j = i + 1; j < contours.length && next === null; j++) {
      next = certain[j];
    }
    const votes = [prev, next].filter((v) => candidates.includes(v));
    if (votes.length && votes.every((v) => v === votes[0])) {
      lines[i] = votes[0];
      return;
    }
    ambiguous++;
    let best = candidates[0];
    let bestGap = Infinity;
    contours.forEach((other, j) => {
      if (!candidates.includes(certain[j])) return;
      const g = gap(box, other.box);
      if (g < bestGap) {
        bestGap = g;
        best = certain[j];
      }
    });
    lines[i] = best;
  });

  contours.forEach(({ box }, i) => {
    for (let k = 1; k <= NEIGHBORS; k++) {
      for (const j of [i - k, i + k]) {
        const other = contours[j];
        if (other && other.box !== box && inside(box, other.box)) {
          lines[i] = lines[j];
          return;
        }
      }
    }
  });

  return { lines, ambiguous };
}

export function spaceContent(svg, height) {
  const matrix = parseMatrix(svg);
  const content = svg
    .slice(svg.indexOf('<g id="content"'))
    .split('class="ayahPolygon"')[0];
  const contours = [];
  for (const [, x, y, paths] of content.matchAll(
    /<g transform="translate\(([-\d.]+)[ ,]([-\d.]+)\)">((?:<path[^>]*\/>)+)<\/g>/g,
  )) {
    const tx = Number(x);
    const ty = Number(y);
    for (const [tag, d] of paths.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*\/>/g)) {
      const rule = /fill-rule="evenodd"/.test(tag) ? "evenodd" : "nonzero";
      for (const part of subpaths(d)) {
        contours.push({
          ...part,
          tx,
          ty,
          rule,
          box: toOuter(matrix, part.box, tx, ty),
        });
      }
    }
  }

  const { lines, ambiguous } = assignLines(contours);
  const groups = new Map();
  contours.forEach((contour, i) => {
    const key = `${lines[i]}|${contour.tx}|${contour.ty}|${contour.rule}`;
    if (!groups.has(key)) groups.set(key, { line: lines[i], contour, ds: [] });
    groups.get(key).ds.push(contour.d);
  });

  const { a, d, e, f } = matrix;
  const body = [...groups.values()]
    .map(
      ({ line, contour: { tx, ty, rule }, ds }) =>
        `<g transform="translate(0 ${round(line * LINE_GAP)})"><g transform="matrix(${a} 0 0 ${d} ${e} ${f})"><g transform="translate(${tx} ${ty})"><path d="${ds.join("")}" fill="#000000" fill-rule="${rule}"/></g></g></g>`,
    )
    .join("");
  const width = svg.match(/viewBox="[-\d.]+ [-\d.]+ ([-\d.]+)/)[1];
  const viewBox = `0 0 ${width} ${round(spacedHeight(height))}`;
  return {
    viewBox,
    ambiguous,
    textSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`,
  };
}

const parseTranslate = (transform) =>
  transform.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)(.*)/);

export function markerBox(matrix, transform, d) {
  const [, x, y, rest = ""] = parseTranslate(transform);
  const scaleMatch = rest.match(/scale\(([-\d.]+)[ ,]([-\d.]+)\)/);
  const scale = scaleMatch
    ? [Number(scaleMatch[1]), Number(scaleMatch[2])]
    : [1, 1];
  const local = subpaths(d).reduce(
    (acc, { box }) => [
      Math.min(acc[0], box[0]),
      Math.min(acc[1], box[1]),
      Math.max(acc[2], box[2]),
      Math.max(acc[3], box[3]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
  return toOuter(matrix, local, Number(x), Number(y), scale);
}

export function shiftMarker(matrix, transform, d) {
  const [, x, y, rest = ""] = parseTranslate(transform);
  const shift = slotOf(centerY(markerBox(matrix, transform, d))) * LINE_GAP;
  return `translate(${x} ${round(Number(y) + shift / matrix.d)})${rest}`;
}

export const shiftY = (y) => y + slotOf(y) * LINE_GAP;
