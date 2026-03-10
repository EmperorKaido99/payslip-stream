import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { Employee, MatchedPayslip, UnmatchedPage, ProcessingResult } from '../types';
import { matchEmployeeToText, generateFileName } from './nameMatcher';
import { extractDateFromText } from './dateExtractor';

// Use CDN worker to avoid Vite config complexity
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractPageText(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const textContent = await page.getTextContent();
  const text = textContent.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ');
  return text;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

/**
 * Main processing function.
 * - Loads the PDF with PDF.js for text extraction
 * - Loads the PDF with pdf-lib for page splitting
 * - For each page: extract text → match employee → extract date
 * - Returns matched payslips and unmatched pages/employees
 */
export async function processPdf(
  pdfFile: File,
  employees: Employee[],
  onProgress: (current: number, total: number, message: string) => void
): Promise<ProcessingResult> {
  onProgress(0, 1, 'Loading PDF…');

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);

  // Load with PDF.js for text extraction
  const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const totalPages = pdfjsDoc.numPages;

  // Load with pdf-lib for splitting
  const pdfLibDoc = await PDFDocument.load(pdfBytes);

  console.log(`[PDF] ${totalPages} pages, matching against ${employees.length} employees`);

  // Track which employees have already been matched
  const matchedEmployeeIds = new Set<string>();
  const matchedMap = new Map<string, MatchedPayslip>(); // employeeId → MatchedPayslip
  const unmatchedPages: UnmatchedPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress(pageNum, totalPages, `Analysing page ${pageNum} of ${totalPages}…`);

    const pageText = await extractPageText(pdfjsDoc, pageNum);

    // Only try to match against unmatched employees
    const remainingEmployees = employees.filter(e => !matchedEmployeeIds.has(e.id));
    const matched = matchEmployeeToText(pageText, remainingEmployees);

    if (matched) {
      matchedEmployeeIds.add(matched.id);
      const dateStr = extractDateFromText(pageText);
      const fileName = generateFileName(matched, dateStr);

      console.log(`[PDF] Page ${pageNum} → ${matched.name} ${matched.surname} (${dateStr})`);

      matchedMap.set(matched.id, {
        employee: matched,
        pageNumbers: [pageNum],
        dateString: dateStr,
        fileName,
        status: 'pending',
      });
    } else {
      const preview = pageText.slice(0, 120).replace(/\s+/g, ' ').trim();
      unmatchedPages.push({ pageNumber: pageNum, textPreview: preview });
      console.log(`[PDF] Page ${pageNum} → no match. Preview: "${preview.slice(0, 80)}"`);
    }
  }

  // Extract individual PDF pages for each match
  onProgress(totalPages, totalPages, 'Splitting PDF pages…');

  const matchedPayslips: MatchedPayslip[] = [];

  for (const payslip of matchedMap.values()) {
    try {
      const singlePagePdf = await PDFDocument.create();
      // Copy all pages belonging to this employee (supports multi-page payslips)
      const pageIndices = payslip.pageNumbers.map(n => n - 1); // 0-indexed
      const copiedPages = await singlePagePdf.copyPages(pdfLibDoc, pageIndices);
      for (const page of copiedPages) singlePagePdf.addPage(page);
      const pdfBytes = await singlePagePdf.save();

      matchedPayslips.push({ ...payslip, status: 'ready', pdfBytes });
    } catch (err) {
      console.error(`[PDF] Failed to extract pages for ${payslip.fileName}:`, err);
      matchedPayslips.push({ ...payslip, status: 'failed', error: (err as Error).message });
    }
  }

  const unmatchedEmployees = employees.filter(e => !matchedEmployeeIds.has(e.id));

  return { matched: matchedPayslips, unmatchedPages, unmatchedEmployees };
}
