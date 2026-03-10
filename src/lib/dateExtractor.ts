const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const MONTH_ABBR = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Attempts to extract a "Month YYYY" string from page text.
 * Falls back to current month/year if nothing is found.
 */
export function extractDateFromText(text: string): string {
  const lower = text.toLowerCase();

  // Pattern: "March 2026" or "MARCH, 2026" or "March-2026"
  const fullMonthPattern = new RegExp(
    `(${MONTH_NAMES.join('|')})[\\s,\\-/]*(20\\d{2}|19\\d{2})`,
    'i'
  );
  const fullMatch = lower.match(fullMonthPattern);
  if (fullMatch) {
    const monthIdx = MONTH_NAMES.indexOf(fullMatch[1].toLowerCase());
    return `${capitalise(MONTH_NAMES[monthIdx])} ${fullMatch[2]}`;
  }

  // Pattern: "Mar 2026" (abbreviation)
  const abbrPattern = new RegExp(
    `\\b(${MONTH_ABBR.join('|')})[\\s,\\-/]*(20\\d{2}|19\\d{2})`,
    'i'
  );
  const abbrMatch = lower.match(abbrPattern);
  if (abbrMatch) {
    const monthIdx = MONTH_ABBR.indexOf(abbrMatch[1].toLowerCase());
    return `${capitalise(MONTH_NAMES[monthIdx])} ${abbrMatch[2]}`;
  }

  // Pattern: "03/2026" or "03-2026"
  const numericPattern = /\b(0?[1-9]|1[0-2])[\/\-](20\d{2})\b/;
  const numMatch = text.match(numericPattern);
  if (numMatch) {
    const monthIdx = parseInt(numMatch[1], 10) - 1;
    return `${capitalise(MONTH_NAMES[monthIdx])} ${numMatch[2]}`;
  }

  // Pattern: "2026/03" or "2026-03"
  const isoPattern = /\b(20\d{2})[\/\-](0?[1-9]|1[0-2])\b/;
  const isoMatch = text.match(isoPattern);
  if (isoMatch) {
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    return `${capitalise(MONTH_NAMES[monthIdx])} ${isoMatch[1]}`;
  }

  // Fallback to current month/year
  const now = new Date();
  return now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
