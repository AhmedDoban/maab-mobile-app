const LINE_TOP = 8.4;
const LINE_PITCH = (546 - 8.4) / 15;
const LINE_GAP = 7;
const LINES = 15;
const FIRST_SPACED_PAGE = 3;

type Box = [number, number, number, number];

const slotOf = (y: number) =>
  Math.min(LINES - 1, Math.max(0, Math.floor((y - LINE_TOP) / LINE_PITCH)));

export const spaceBoxes = (page: number, boxes: Box[]): Box[] =>
  page < FIRST_SPACED_PAGE
    ? boxes
    : boxes.map(([x0, y0, x1, y1]) => {
        const shift = slotOf((y0 + y1) / 2) * LINE_GAP;
        return [x0, y0 + shift - LINE_GAP / 2, x1, y1 + shift + LINE_GAP / 2];
      });
