import { DayType, UserSettings, CalendarEvent } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${days[date.getDay()]} // ${String(d).padStart(2, '0')} ${months[date.getMonth()]} ${y}`;
}

export function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${d}`;
}

export function calculateDayNumber(startDateStr: string, targetDateStr: string): number {
  if (!startDateStr || !targetDateStr) return 1;
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ty, tm, td] = targetDateStr.split('-').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const target = new Date(ty, tm - 1, td);

  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function detectDayType(
  dateStr: string,
  settings: UserSettings | null,
  calendarEvents: CalendarEvent[] = []
): DayType {
  // Check explicit calendar events for this date
  const event = calendarEvents.find((e) => e.date === dateStr);
  if (event) {
    if (event.type === 'HOLIDAY') return 'HOLIDAY';
    if (event.type === 'SCHOOL') return 'SCHOOL';
    if (event.type === 'CUSTOM') return 'CUSTOM';
  }

  // Fallback to day of week using user settings
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday

  const schoolDays = settings?.schoolDays ?? [1, 2, 3, 4, 5, 6];
  if (schoolDays.includes(dayOfWeek)) {
    return 'SCHOOL';
  }
  return 'HOLIDAY';
}

export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function isTimeInRange(startTimeStr: string, endTimeStr: string, currentMinutes: number): boolean {
  const start = timeStringToMinutes(startTimeStr);
  let end = timeStringToMinutes(endTimeStr);
  if (end < start) end += 1440; // overnight block

  let cur = currentMinutes;
  if (cur < start && end >= 1440) cur += 1440;

  return cur >= start && cur < end;
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getCurrentTimeHHMMSS(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ry = date.getFullYear();
  const rm = String(date.getMonth() + 1).padStart(2, '0');
  const rd = String(date.getDate()).padStart(2, '0');
  return `${ry}-${rm}-${rd}`;
}
