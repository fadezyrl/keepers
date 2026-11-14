/**
 * Calendar date helpers that treat trip dates as civil YYYY-MM-DD values.
 * Never parse bare `YYYY-MM-DD` with `new Date(string)` — that shifts to UTC.
 */

export type CivilDate = {year: number; month: number; day: number};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function parseYmd(ymd: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return {year, month, day};
}

export function toYmd(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function civilFromDate(date: Date): CivilDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function todayYmd(): string {
  const t = civilFromDate(new Date());
  return toYmd(t.year, t.month, t.day);
}

export function addMonths(year: number, month: number, delta: number): CivilDate {
  const index = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(index / 12);
  const nextMonth = (index % 12) + 1;
  return {year: nextYear, month: nextMonth, day: 1};
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Sunday = 0 … Saturday = 6 for the 1st of the month (local). */
export function weekdayOfFirst(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function monthRangeYmd(
  year: number,
  month: number,
): {from: string; to: string} {
  const last = daysInMonth(year, month);
  return {
    from: toYmd(year, month, 1),
    to: toYmd(year, month, last),
  };
}

export function monthLabel(year: number, month: number): string {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString(undefined, {month: 'long', year: 'numeric'});
}

export function sameYmd(a: string, b: string): boolean {
  return a === b;
}

/** Build a 6×7 grid of YMD strings (null = outside month). Weeks start on Sunday. */
export function buildMonthGrid(
  year: number,
  month: number,
): Array<string | null> {
  const firstWeekday = weekdayOfFirst(year, month);
  const totalDays = daysInMonth(year, month);
  const cells: Array<string | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(toYmd(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  while (cells.length < 42) {
    cells.push(null);
  }
  return cells;
}

export function tripDateKey(date: string): string {
  const parsed = parseYmd(String(date).slice(0, 10));
  if (!parsed) return String(date).slice(0, 10);
  return toYmd(parsed.year, parsed.month, parsed.day);
}

export function formatTripTime(time?: string | null): string {
  if (!time) return '';
  const t = String(time).slice(0, 5);
  const [hh, mm] = t.split(':').map(Number);
  if (Number.isNaN(hh)) return t;
  const d = new Date(2000, 0, 1, hh || 0, mm || 0, 0);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
