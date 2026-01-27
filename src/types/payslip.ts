export interface Employee {
  id: string;
  name: string;
  surname: string;
  id_number: string;
}

export interface ProcessedFile {
  id: string;
  fileName: string;
  employeeId: string;
  employeeName: string;
  pageNumber: number;
  status: 'pending' | 'processing' | 'ready' | 'encrypted' | 'failed';
}

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: 'excel' | 'pdf';
}

export type WorkflowStep = 'upload-database' | 'upload-pdf' | 'processing' | 'results' | 'encryption';

export interface WorkflowState {
  currentStep: WorkflowStep;
  excelFile: UploadedFile | null;
  pdfFile: UploadedFile | null;
  employees: Employee[];
  processedFiles: ProcessedFile[];
  processingProgress: number;
  encryptionProgress: number;
  isProcessingComplete: boolean;
  isEncryptionComplete: boolean;
}
