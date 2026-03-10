import { Employee } from '../types';

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

interface MatchScore {
  employee: Employee;
  score: number;
}

/**
 * Finds the best matching employee for a given page text.
 * Scoring:
 *   4 = full name match "John Smith" in text
 *   3 = reversed full name match "Smith John" in text
 *   2 = both name and surname appear independently in text
 *   0 = no match
 */
export function matchEmployeeToText(
  pageText: string,
  employees: Employee[]
): Employee | null {
  const normText = normalise(pageText);
  const scores: MatchScore[] = [];

  for (const emp of employees) {
    const normName = normalise(emp.name);
    const normSurname = normalise(emp.surname);

    if (!normName || !normSurname) continue;

    let score = 0;

    // Full name forward: "John Smith"
    if (normText.includes(`${normName} ${normSurname}`)) {
      score = Math.max(score, 4);
    }

    // Full name reversed: "Smith John"
    if (normText.includes(`${normSurname} ${normName}`)) {
      score = Math.max(score, 3);
    }

    // Both tokens present but not necessarily adjacent
    if (score === 0) {
      const hasName = normText.includes(normName);
      const hasSurname = normText.includes(normSurname);
      if (hasName && hasSurname) {
        score = 2;
      }
    }

    if (score > 0) scores.push({ employee: emp, score });
  }

  if (scores.length === 0) return null;

  // Return the highest-scoring match
  scores.sort((a, b) => b.score - a.score);
  return scores[0].employee;
}

/**
 * Generates the output file name.
 * Format: "John Smith - March 2026.pdf"
 */
export function generateFileName(employee: Employee, dateStr: string): string {
  const safeName = `${employee.name} ${employee.surname}`
    .replace(/[<>:"/\\|?*]/g, '')
    .trim();
  return `${safeName} - ${dateStr}.pdf`;
}
