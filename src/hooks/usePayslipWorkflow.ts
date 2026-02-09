import { useState, useCallback } from 'react';
import { WorkflowState, WorkflowStep, UploadedFile, Employee, ProcessedFile, EncryptionKeyData } from '@/types/payslip';
import * as XLSX from 'xlsx';
import { setOriginalPdfBytes, setDatabaseFileName, clearOriginalPdfBytes, getPdfPageCount, extractAndEncryptPage } from '@/lib/pdfSplitter';

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
        
        console.log('Raw Excel data:', jsonData);
        
        if (jsonData.length === 0) {
          console.warn('Excel file is empty or has no data rows');
          resolve([]);
          return;
        }
        
        // Log available columns for debugging
        const firstRow = jsonData[0] as Record<string, any>;
        const availableColumns = Object.keys(firstRow);
        console.log('Available columns in Excel:', availableColumns);
        
        // Find matching columns (case-insensitive)
        const findColumn = (row: Record<string, any>, ...variations: string[]): string => {
          for (const variation of variations) {
            const key = Object.keys(row).find(k => k.toLowerCase() === variation.toLowerCase());
            if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
              return String(row[key]).trim();
            }
          }
          return '';
        };
        
        // Map the Excel columns to our Employee interface
        const employees: Employee[] = jsonData.map((row: any, index: number) => {
          const name = findColumn(row, 'name', 'first_name', 'firstname', 'first name', 'employee_name', 'employeename');
          const surname = findColumn(row, 'surname', 'last_name', 'lastname', 'last name', 'family_name');
          const id_number = findColumn(row, 'id_number', 'id', 'employee_id', 'employeeid', 'emp_id', 'empid', 'id number', 'idnumber', 'national_id', 'staff_id', 'staffid');
          
          return {
            id: `emp-${index + 1}`,
            name,
            surname,
            id_number,
          };
        }).filter(emp => {
          // Only require id_number - name can be optional
          const hasId = emp.id_number.length > 0;
          const hasName = emp.name.length > 0 || emp.surname.length > 0;
          
          if (!hasId) {
            console.warn(`Row skipped - missing ID number:`, emp);
          }
          
          return hasId && hasName;
        });
        
        console.log(`Successfully parsed ${employees.length} employees from ${jsonData.length} rows`);
        console.log('Parsed employees:', employees);
        
        if (employees.length === 0 && jsonData.length > 0) {
          console.error('No employees parsed. Please check that your Excel has columns for: name/first_name AND id_number/id/employee_id');
          console.error('Your columns are:', availableColumns);
        }
        
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
      
      setDatabaseFileName(file.name);
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

  const uploadPdf = useCallback(async (file: File) => {
    const uploadedFile: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: 'pdf',
    };
    
    try {
      // Read the PDF file as bytes and store it for later splitting
      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      setOriginalPdfBytes(pdfBytes);
      
      // Get the page count for validation
      const pageCount = await getPdfPageCount(pdfBytes);
      console.log(`PDF loaded: ${file.name} with ${pageCount} pages`);
      
      setState(prev => ({
        ...prev,
        pdfFile: uploadedFile,
      }));
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setState(prev => ({
        ...prev,
        pdfFile: uploadedFile,
      }));
    }
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

  const startEncryption = useCallback(async () => {
    setState(prev => ({ ...prev, encryptionProgress: 0 }));

    const currentState = await new Promise<WorkflowState>(resolve => {
      setState(prev => { resolve(prev); return prev; });
    });

    const files = currentState.processedFiles;
    const total = files.length;
    let completed = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        await extractAndEncryptPage(file.pageNumber, file.employeeId);
        completed++;
        const progress = Math.round((completed / total) * 100);
        setState(prev => ({
          ...prev,
          encryptionProgress: Math.min(progress, 99),
          processedFiles: prev.processedFiles.map(f =>
            f.id === file.id ? { ...f, status: 'encrypted' as const } : f
          ),
        }));
      } catch (error) {
        console.error(`Failed to encrypt ${file.fileName}:`, error);
        errors.push(`${file.fileName}: ${(error as Error).message}`);
        completed++;
        setState(prev => ({
          ...prev,
          encryptionProgress: Math.round((completed / total) * 100),
        }));
      }
    }

    setState(prev => ({
      ...prev,
      encryptionProgress: 100,
      isEncryptionComplete: errors.length === 0 || completed > errors.length,
    }));

    if (errors.length > 0) {
      console.warn(`${errors.length}/${total} files failed encryption`);
    }
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
    clearOriginalPdfBytes();
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
