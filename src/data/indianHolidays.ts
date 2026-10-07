export interface HolidayDefinition {
  date: string; // YYYY-MM-DD
  title: string;
  type: 'FESTIVAL' | 'NATIONAL_HOLIDAY' | 'SCHOOL_HOLIDAY';
  capacityMultiplier: number; // e.g., 0.4 for festival, 1.0 for standard holiday
}

export const OFFICIAL_INDIAN_HOLIDAYS_2026_2027: HolidayDefinition[] = [
  { date: '2026-10-02', title: 'Mahatma Gandhi Jayanti', type: 'NATIONAL_HOLIDAY', capacityMultiplier: 1.0 },
  { date: '2026-10-20', title: 'Dussehra (Vijayadashami)', type: 'FESTIVAL', capacityMultiplier: 0.5 },
  { date: '2026-11-08', title: 'Diwali (Deepavali)', type: 'FESTIVAL', capacityMultiplier: 0.3 },
  { date: '2026-11-09', title: 'Govardhan Puja', type: 'FESTIVAL', capacityMultiplier: 0.4 },
  { date: '2026-11-10', title: 'Bhai Dooj', type: 'FESTIVAL', capacityMultiplier: 0.5 },
  { date: '2026-11-15', title: 'Chhath Puja', type: 'FESTIVAL', capacityMultiplier: 0.5 },
  { date: '2026-11-24', title: 'Guru Nanak Jayanti', type: 'NATIONAL_HOLIDAY', capacityMultiplier: 0.8 },
  { date: '2026-12-25', title: 'Christmas Day', type: 'FESTIVAL', capacityMultiplier: 0.6 },
  { date: '2027-01-01', title: 'New Year Day', type: 'SCHOOL_HOLIDAY', capacityMultiplier: 0.8 },
  { date: '2027-01-14', title: 'Makar Sankranti / Pongal', type: 'FESTIVAL', capacityMultiplier: 0.6 },
  { date: '2027-01-26', title: 'Republic Day', type: 'NATIONAL_HOLIDAY', capacityMultiplier: 0.9 },
  { date: '2027-02-12', title: 'Maha Shivratri', type: 'FESTIVAL', capacityMultiplier: 0.6 },
  { date: '2027-03-22', title: 'Holi', type: 'FESTIVAL', capacityMultiplier: 0.4 },
];
