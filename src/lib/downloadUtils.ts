import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ProcessedFile } from '@/types/payslip';

// Generate a mock PDF content (simple placeholder)
const generateMockPdfContent = (fileName: string, employeeId: string, isEncrypted: boolean): Blob => {
  // Create a simple text-based mock PDF content
  const content = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(PaySync Generated Payslip) Tj
0 -30 Td
/F1 14 Tf
(File: ${fileName}) Tj
0 -20 Td
(Employee ID: ${employeeId}) Tj
0 -20 Td
(Status: ${isEncrypted ? 'Encrypted' : 'Processed'}) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj

xref
0 5
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
500
%%EOF`;

  return new Blob([content], { type: 'application/pdf' });
};

export const downloadSingleFile = (file: ProcessedFile, isEncrypted: boolean = false): void => {
  const blob = generateMockPdfContent(file.fileName, file.employeeId, isEncrypted);
  saveAs(blob, file.fileName);
};

export const downloadAllAsZip = async (
  files: ProcessedFile[], 
  isEncrypted: boolean = false,
  zipFileName: string = 'payslips.zip'
): Promise<void> => {
  const zip = new JSZip();

  files.forEach((file) => {
    const blob = generateMockPdfContent(file.fileName, file.employeeId, isEncrypted);
    zip.file(file.fileName, blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipFileName);
};
