const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function todayStr(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function tomorrowStr(): string {
  return todayStr(addDays(new Date(), 1));
}

const EVENING_HOUR = 21;
const EVENING_MIN = 30;

export function isEveningNow(d: Date = new Date()): boolean {
  return (
    d.getHours() > EVENING_HOUR ||
    (d.getHours() === EVENING_HOUR && d.getMinutes() >= EVENING_MIN)
  );
}

const DAY_NAMES = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
const MONTH_NAMES = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export function prettyDateBn(d: Date = new Date()): string {
  return `${DAY_NAMES[d.getDay()]}, ${toBn(d.getDate())} ${MONTH_NAMES[d.getMonth()]}`;
}
