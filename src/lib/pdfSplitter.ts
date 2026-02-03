import { PDFDocument } from 'pdf-lib-with-encrypt';
import { ProcessedFile } from '@/types/payslip';

// Store the original PDF bytes in memory for later splitting
let originalPdfBytes: Uint8Array | null = null;

export const setOriginalPdfBytes = (bytes: Uint8Array) => {
  originalPdfBytes = bytes;
  console.log(`Stored original PDF (${bytes.length} bytes) for splitting`);
};

export const getOriginalPdfBytes = (): Uint8Array | null => {
  return originalPdfBytes;
};

export const clearOriginalPdfBytes = () => {
  originalPdfBytes = null;
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

// Extract a single page and encrypt it with a password
export const extractAndEncryptPage = async (
  pageNumber: number,
  password: string
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

    // Apply encryption with the password
    const sanitizedPassword = password.trim().replace(/\s+/g, '').replace(/[\r\n]/g, '');
    
    newPdf.encrypt({
      userPassword: sanitizedPassword,
      ownerPassword: 'PaySyncAdmin2024!SecureOwner',
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    // Save and return the encrypted single-page PDF
    const pdfBytes = await newPdf.save();
    console.log(`Extracted and encrypted page ${pageNumber} with password (${pdfBytes.length} bytes)`);
    
    return pdfBytes;
  } catch (error) {
    console.error(`Failed to extract/encrypt page ${pageNumber}:`, error);
    throw error;
  }
};
