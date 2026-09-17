const TIMEZONE = "Asia/Dhaka";
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

type DhakaParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
};

function dhakaParts(d: Date): DhakaParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  return {
    year,
    month,
    day,
    hour: Number(get("hour")) % 24,
    minute: Number(get("minute")),
    // Dhaka noon is 06:00 UTC on the same calendar date (no DST).
    weekday: new Date(Date.UTC(year, month - 1, day, 6)).getUTCDay(),
  };
}

export function todayStr(d: Date = new Date()): string {
  const { year, month, day } = dhakaParts(d);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDays(base: Date, n: number): Date {
  return new Date(base.getTime() + n * 86_400_000);
}

export function tomorrowStr(): string {
  return todayStr(addDays(new Date(), 1));
}

const EVENING_HOUR = 21;
const EVENING_MIN = 30;

export function isEveningNow(d: Date = new Date()): boolean {
  const { hour, minute } = dhakaParts(d);
  return hour > EVENING_HOUR || (hour === EVENING_HOUR && minute >= EVENING_MIN);
}

const DAY_NAMES = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const MONTH_NAMES = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export function prettyDateBn(d: Date = new Date()): string {
  const { weekday, day, month } = dhakaParts(d);
  return `${DAY_NAMES[weekday]}, ${toBn(day)} ${MONTH_NAMES[month - 1]}`;
}
