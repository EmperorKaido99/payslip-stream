import { PDFDocument } from 'pdf-lib';
import { ProcessedFile } from '@/types/payslip';
import { encryptPdfViaAzure } from './azureEncryptionService';

// Store the original PDF bytes in memory for later splitting
let originalPdfBytes: Uint8Array | null = null;
let databaseFileName: string | null = null;

export const setOriginalPdfBytes = (bytes: Uint8Array) => {
  originalPdfBytes = bytes;
  console.log(`Stored original PDF (${bytes.length} bytes) for splitting`);
};

export const setDatabaseFileName = (fileName: string) => {
  databaseFileName = fileName;
  console.log(`Stored database filename: ${fileName}`);
};

export const getOriginalPdfBytes = (): Uint8Array | null => {
  return originalPdfBytes;
};

export const clearOriginalPdfBytes = () => {
  originalPdfBytes = null;
  databaseFileName = null;
};

export const getPdfPageCount = async (pdfBytes: Uint8Array): Promise<number> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Failed to get PDF page count:', error);
    throw error;
  }
};

// Extract a single page from the original PDF
export const extractPageFromPdf = async (
  pageNumber: number // 1-indexed
): Promise<Uint8Array> => {
  if (!originalPdfBytes) {
    throw new Error('No PDF loaded. Please upload a PDF first.');
  }

  try {
    // Load the original PDF
    const originalPdf = await PDFDocument.load(originalPdfBytes);
    const pageCount = originalPdf.getPageCount();
    
    if (pageNumber < 1 || pageNumber > pageCount) {
      throw new Error(`Page ${pageNumber} does not exist. PDF has ${pageCount} pages.`);
    }

    // Create a new PDF with just the requested page
    const newPdf = await PDFDocument.create();
    
    // Copy the page (pageNumber is 1-indexed, but copyPages uses 0-indexed)
    const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNumber - 1]);
    newPdf.addPage(copiedPage);

    // Save and return the single-page PDF
    const pdfBytes = await newPdf.save();
    console.log(`Extracted page ${pageNumber} (${pdfBytes.length} bytes)`);
    
    return pdfBytes;
  } catch (error) {
    console.error(`Failed to extract page ${pageNumber}:`, error);
    throw error;
  }
};

// Extract a single page and encrypt it via Azure
export const extractAndEncryptPage = async (
  pageNumber: number,
  employeeId: string
): Promise<Uint8Array> => {
  if (!databaseFileName) {
    throw new Error('No database file specified. Please upload the employee database first.');
  }

  // First extract the page as an unencrypted single-page PDF
  const pageBytes = await extractPageFromPdf(pageNumber);

  // Send to Azure Function for encryption
  try {
    const encryptedBytes = await encryptPdfViaAzure(
      pageBytes,
      employeeId,
      databaseFileName
    );
    console.log(`Encrypted page ${pageNumber} via Azure Function (${encryptedBytes.length} bytes)`);
    return encryptedBytes;
  } catch (error) {
    console.error(`Azure encryption failed for page ${pageNumber}:`, error);
    throw error;
  }
};
