/**
 * Financial & Activity Date Formatting Utilities
 * Standardizes all date formats to DD-MM-YYYY
 */

/**
 * Formats a Date object, ISO string, or YYYY-MM-DD string to "DD-MM-YYYY"
 * e.g., '2026-08-22' -> '22-08-2026'
 */
export function formatDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(dateInput).trim();

  // If already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }

  // If in YYYY-MM-DD format (or with time: YYYY-MM-DDTHH:mm:ss...)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // Fallback: parse as Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return str;
}

/**
 * Formats a Date object or string to "DD-MM-YYYY, DayName"
 * e.g. "22-08-2026, Saturday"
 */
export function formatDateWithDayName(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  let d: Date;
  if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    // If YYYY-MM-DD
    const parts = String(dateInput).split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
      d = new Date(dateInput);
    }
  }

  if (isNaN(d.getTime())) return formatDDMMYYYY(dateInput);

  const formattedDate = formatDDMMYYYY(d);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[d.getDay()];

  return `${formattedDate} • ${dayName}`;
}

/**
 * Returns today in YYYY-MM-DD format (used for storage/comparisons)
 */
export function getTodayYYYYMMDD(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today in DD-MM-YYYY format
 */
export function getTodayDDMMYYYY(): string {
  return formatDDMMYYYY(new Date());
}
