export interface Employee {
  id: string;
  name: string;
  surname: string;
}

export interface MatchedPayslip {
  employee: Employee;
  pageNumbers: number[]; // supports multi-page payslips
  dateString: string;
  fileName: string;
  status: 'pending' | 'extracting' | 'ready' | 'failed';
  error?: string;
  pdfBytes?: Uint8Array;
}

export interface UnmatchedPage {
  pageNumber: number;
  textPreview: string;
}

export type AppStep = 'upload' | 'processing' | 'results';

export interface ProcessingResult {
  matched: MatchedPayslip[];
  unmatchedPages: UnmatchedPage[];
  unmatchedEmployees: Employee[];
}
