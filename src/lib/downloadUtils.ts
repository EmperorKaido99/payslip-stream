import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProcessedFile } from '@/types/payslip';
import { extractPageFromPdf, extractAndEncryptPage } from './pdfSplitter';

// Sanitize employee ID to ensure it's clean (remove whitespace, newlines, etc.)
const sanitizeEmployeeId = (id: string): string => {
  return id.trim().replace(/\s+/g, '').replace(/[\r\n]/g, '');
};

export const downloadSingleFile = async (file: ProcessedFile, isEncrypted: boolean = false): Promise<void> => {
  try {
    const pdfBytes = isEncrypted 
      ? await extractAndEncryptPage(file.pageNumber, file.employeeId)
      : await extractPageFromPdf(file.pageNumber);
    
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    saveAs(blob, file.fileName);
  } catch (error) {
    console.error(`Failed to download ${file.fileName}:`, error);
    throw error;
  }
};

export const downloadAllAsZip = async (
  files: ProcessedFile[], 
  isEncrypted: boolean = false,
  zipFileName: string = 'payslips.zip'
): Promise<void> => {
  const zip = new JSZip();
  const errors: string[] = [];

  // Extract all pages with error handling
  const pdfPromises = files.map(async (file) => {
    try {
      const pdfBytes = isEncrypted 
        ? await extractAndEncryptPage(file.pageNumber, file.employeeId)
        : await extractPageFromPdf(file.pageNumber);
      return { fileName: file.fileName, pdfBytes, success: true };
    } catch (error) {
      console.error(`Failed to extract PDF for ${file.employeeName}:`, error);
      errors.push(`${file.employeeName}: ${(error as Error).message}`);
      return { fileName: file.fileName, pdfBytes: null, success: false };
    }
  });

  const results = await Promise.all(pdfPromises);
  
  // Add successful PDFs to zip
  results.forEach(({ fileName, pdfBytes, success }) => {
    if (success && pdfBytes) {
      zip.file(fileName, pdfBytes);
    }
  });

  // If there were errors, add an error log file
  if (errors.length > 0) {
    const errorLog = `PDF Extraction Errors:\n\n${errors.join('\n')}`;
    zip.file('_ERRORS.txt', errorLog);
    console.warn(`${errors.length} PDFs failed to extract. See _ERRORS.txt in the zip file.`);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFileName);
  
  console.log(`✓ Downloaded ${results.filter(r => r.success).length}/${files.length} PDFs successfully`);
};

// Export the sanitization function for use in other modules
export { sanitizeEmployeeId };
