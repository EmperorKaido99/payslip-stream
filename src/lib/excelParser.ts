import * as XLSX from 'xlsx';
import { Employee } from '../types';

const COLUMN_ALIASES: Record<string, string[]> = {
  name: ['name', 'first_name', 'firstname', 'first name', 'forename', 'given name', 'employee name', 'employee_name'],
  surname: ['surname', 'last_name', 'lastname', 'last name', 'family_name', 'familyname', 'second name'],
};

function findColumn(row: Record<string, unknown>, aliases: string[]): string {
  for (const alias of aliases) {
    const key = Object.keys(row).find(k => k.trim().toLowerCase() === alias.toLowerCase());
    if (key && row[key] != null && String(row[key]).trim() !== '') {
      return String(row[key]).trim();
    }
  }
  return '';
}

export async function parseExcelFile(file: File): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

        if (rows.length === 0) {
          reject(new Error('Excel file appears to be empty.'));
          return;
        }

        const firstRow = rows[0];
        const availableColumns = Object.keys(firstRow);
        console.log('[Excel] Available columns:', availableColumns);

        const employees: Employee[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const name = findColumn(row, COLUMN_ALIASES.name);
          const surname = findColumn(row, COLUMN_ALIASES.surname);

          if (!name && !surname) continue;
          if (!name || !surname) {
            console.warn(`[Excel] Row ${i + 1} missing name or surname:`, row);
            continue;
          }

          employees.push({
            id: `emp-${i}-${name}-${surname}`,
            name: name.trim(),
            surname: surname.trim(),
          });
        }

        console.log(`[Excel] Parsed ${employees.length} employees from ${rows.length} rows`);

        if (employees.length === 0) {
          reject(new Error(
            `No employees found. Make sure your Excel has columns named:\n` +
            `• Name column: ${COLUMN_ALIASES.name.slice(0, 4).join(', ')}\n` +
            `• Surname column: ${COLUMN_ALIASES.surname.slice(0, 4).join(', ')}\n\n` +
            `Your columns are: ${availableColumns.join(', ')}`
          ));
          return;
        }

        resolve(employees);
      } catch (err) {
        reject(new Error(`Failed to parse Excel: ${(err as Error).message}`));
      }
    };
    reader.onerror = () => reject(new Error('Could not read the Excel file.'));
    reader.readAsArrayBuffer(file);
  });
}
