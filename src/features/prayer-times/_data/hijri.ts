export type HijriDate = {
  day: number;
  month: number;
  year: number;
  weekday: number;
};

function fromIntl(date: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date);
    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    const day = get("day");
    const month = get("month");
    const year = get("year");
    if (day >= 1 && day <= 30 && month >= 1 && month <= 12 && year > 1300) {
      return { day, month, year };
    }
  } catch {}
  return null;
}

function tabular(date: Date) {
  const jd =
    Math.floor(
      (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
        Date.UTC(1970, 0, 1)) /
        86400000,
    ) + 2440588;
  const l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  const l1 = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l1) / 5316) * Math.floor((50 * l1) / 17719) +
    Math.floor(l1 / 5670) * Math.floor((43 * l1) / 15238);
  const l2 =
    l1 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l2) / 709);
  const day = l2 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { day, month, year };
}

export function toHijri(date: Date): HijriDate {
  const { day, month, year } = fromIntl(date) ?? tabular(date);
  return { day, month, year, weekday: date.getDay() };
}
