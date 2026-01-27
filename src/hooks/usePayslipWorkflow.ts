import { useState, useCallback } from 'react';
import { WorkflowState, WorkflowStep, UploadedFile, Employee, ProcessedFile } from '@/types/payslip';

const generateMockEmployees = (count: number): Employee[] => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'William', 'Emma'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: firstNames[i % firstNames.length],
    surname: lastNames[i % lastNames.length],
    id_number: `ID${String(100000 + i).padStart(6, '0')}`,
  }));
};

const initialState: WorkflowState = {
  currentStep: 'upload-database',
  excelFile: null,
  pdfFile: null,
  employees: [],
  processedFiles: [],
  processingProgress: 0,
  encryptionProgress: 0,
  isProcessingComplete: false,
  isEncryptionComplete: false,
};

export const usePayslipWorkflow = () => {
  const [state, setState] = useState<WorkflowState>(initialState);

  const setStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const uploadExcel = useCallback((file: File) => {
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: 'excel',
    };
    
    // Generate mock employees (between 5-15 for demo)
    const employeeCount = Math.floor(Math.random() * 11) + 5;
    const mockEmployees = generateMockEmployees(employeeCount);
    
    setState(prev => ({
      ...prev,
      excelFile: uploadedFile,
      employees: mockEmployees,
    }));
  }, []);

  const uploadPdf = useCallback((file: File) => {
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: 'pdf',
    };
    
    setState(prev => ({
      ...prev,
      pdfFile: uploadedFile,
    }));
  }, []);

  const startProcessing = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 'processing', processingProgress: 0 }));
    
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    // Simulate processing with progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setState(prev => {
          const processedFiles: ProcessedFile[] = prev.employees.map((emp, index) => ({
            id: `file-${index + 1}`,
            fileName: `${emp.name}_${emp.surname}_${month}_${year}.pdf`,
            employeeId: emp.id_number,
            employeeName: `${emp.name} ${emp.surname}`,
            pageNumber: index + 1,
            status: 'ready' as const,
          }));
          
          return {
            ...prev,
            processingProgress: 100,
            processedFiles,
            isProcessingComplete: true,
            currentStep: 'results',
          };
        });
      } else {
        setState(prev => ({ ...prev, processingProgress: Math.min(progress, 99) }));
      }
    }, 500);
  }, []);

  const startEncryption = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 'encryption', encryptionProgress: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setState(prev => ({
          ...prev,
          encryptionProgress: 100,
          isEncryptionComplete: true,
          processedFiles: prev.processedFiles.map(f => ({ ...f, status: 'encrypted' as const })),
        }));
      } else {
        setState(prev => ({ ...prev, encryptionProgress: Math.min(progress, 99) }));
      }
    }, 400);
  }, []);

  const loadSampleData = useCallback(() => {
    const mockEmployees = generateMockEmployees(8);
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    
    setState(prev => ({
      ...prev,
      excelFile: {
        file: new File([], 'sample_employees.xlsx'),
        name: 'sample_employees.xlsx',
        size: 24576,
        type: 'excel',
      },
      pdfFile: {
        file: new File([], 'sample_payslips.pdf'),
        name: 'sample_payslips.pdf',
        size: 1048576,
        type: 'pdf',
      },
      employees: mockEmployees,
      processedFiles: mockEmployees.map((emp, index) => ({
        id: `file-${index + 1}`,
        fileName: `${emp.name}_${emp.surname}_${month}_${year}.pdf`,
        employeeId: emp.id_number,
        employeeName: `${emp.name} ${emp.surname}`,
        pageNumber: index + 1,
        status: 'ready' as const,
      })),
      isProcessingComplete: true,
      currentStep: 'results',
    }));
  }, []);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
  }, []);

  const canProceedToPdf = state.excelFile !== null && state.employees.length > 0;
  const canProcess = state.excelFile !== null && state.pdfFile !== null;
  const canEncrypt = state.isProcessingComplete && state.processedFiles.length > 0;

  return {
    state,
    setStep,
    uploadExcel,
    uploadPdf,
    startProcessing,
    startEncryption,
    loadSampleData,
    resetWorkflow,
    canProceedToPdf,
    canProcess,
    canEncrypt,
  };
};
