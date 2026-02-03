import { useState, useCallback } from 'react';
import { WorkflowState, WorkflowStep, UploadedFile, Employee, ProcessedFile, EncryptionKeyData } from '@/types/payslip';
import * as XLSX from 'xlsx';

const parseExcelFile = (file: File): Promise<Employee[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Parsed Excel data:', jsonData);
        
        // Map the Excel columns to our Employee interface
        // Support various column name formats
        const employees: Employee[] = jsonData.map((row: any, index: number) => {
          // Try different column name variations
          const name = row.name || row.Name || row.NAME || row.first_name || row.FirstName || row.firstname || '';
          const surname = row.surname || row.Surname || row.SURNAME || row.last_name || row.LastName || row.lastname || '';
          const id_number = row.id_number || row.ID_Number || row.ID_NUMBER || row.id || row.ID || row.employee_id || row.EmployeeID || '';
          
          return {
            id: `emp-${index + 1}`,
            name: String(name).trim(),
            surname: String(surname).trim(),
            id_number: String(id_number).trim(),
          };
        }).filter(emp => emp.name && emp.id_number); // Filter out empty rows
        
        console.log('Mapped employees:', employees);
        resolve(employees);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
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
  encryptionKeys: null,
};

export const usePayslipWorkflow = () => {
  const [state, setState] = useState<WorkflowState>(initialState);

  const setStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const uploadExcel = useCallback(async (file: File) => {
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: 'excel',
    };
    
    try {
      // Parse the actual Excel file
      const employees = await parseExcelFile(file);
      console.log(`Parsed ${employees.length} employees from Excel file`);
      
      setState(prev => ({
        ...prev,
        excelFile: uploadedFile,
        employees: employees,
      }));
    } catch (error) {
      console.error('Failed to parse Excel file:', error);
      // Set file but with empty employees on error
      setState(prev => ({
        ...prev,
        excelFile: uploadedFile,
        employees: [],
      }));
    }
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

  const setEncryptionKeys = useCallback((keys: EncryptionKeyData[]) => {
    setState(prev => ({ ...prev, encryptionKeys: keys }));
  }, []);

  const startEncryption = useCallback(() => {
    setState(prev => ({ ...prev, encryptionProgress: 0 }));
    
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
    // Sample data for demo purposes
    const sampleEmployees: Employee[] = [
      { id: 'emp-1', name: 'John', surname: 'Smith', id_number: 'ID100001' },
      { id: 'emp-2', name: 'Jane', surname: 'Johnson', id_number: 'ID100002' },
      { id: 'emp-3', name: 'Michael', surname: 'Williams', id_number: 'ID100003' },
      { id: 'emp-4', name: 'Sarah', surname: 'Brown', id_number: 'ID100004' },
      { id: 'emp-5', name: 'David', surname: 'Jones', id_number: 'ID100005' },
      { id: 'emp-6', name: 'Emily', surname: 'Garcia', id_number: 'ID100006' },
      { id: 'emp-7', name: 'Robert', surname: 'Miller', id_number: 'ID100007' },
      { id: 'emp-8', name: 'Lisa', surname: 'Davis', id_number: 'ID100008' },
    ];
    
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
      employees: sampleEmployees,
      processedFiles: sampleEmployees.map((emp, index) => ({
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
  const canEncrypt = state.isProcessingComplete && state.processedFiles.length > 0 && state.encryptionKeys !== null;

  return {
    state,
    setStep,
    uploadExcel,
    uploadPdf,
    startProcessing,
    startEncryption,
    setEncryptionKeys,
    loadSampleData,
    resetWorkflow,
    canProceedToPdf,
    canProcess,
    canEncrypt,
  };
};
