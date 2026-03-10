import { useState, useCallback } from 'react';
import { Employee, MatchedPayslip, UnmatchedPage, AppStep } from '../types';
import { parseExcelFile } from '../lib/excelParser';
import { processPdf } from '../lib/pdfProcessor';

interface ProcessorState {
  step: AppStep;
  employees: Employee[];
  excelFile: File | null;
  pdfFile: File | null;
  pdfPageCount: number | null;
  matched: MatchedPayslip[];
  unmatchedPages: UnmatchedPage[];
  unmatchedEmployees: Employee[];
  processingProgress: number;
  processingTotal: number;
  processingMessage: string;
  error: string | null;
}

const initialState: ProcessorState = {
  step: 'upload',
  employees: [],
  excelFile: null,
  pdfFile: null,
  pdfPageCount: null,
  matched: [],
  unmatchedPages: [],
  unmatchedEmployees: [],
  processingProgress: 0,
  processingTotal: 1,
  processingMessage: '',
  error: null,
};

export function usePayslipProcessor() {
  const [state, setState] = useState<ProcessorState>(initialState);

  const setError = (msg: string) =>
    setState(prev => ({ ...prev, error: msg }));

  const clearError = () => setState(prev => ({ ...prev, error: null }));

  const loadExcel = useCallback(async (file: File) => {
    clearError();
    try {
      const employees = await parseExcelFile(file);
      setState(prev => ({ ...prev, excelFile: file, employees }));
    } catch (err) {
      setError((err as Error).message);
      setState(prev => ({ ...prev, excelFile: null, employees: [] }));
    }
  }, []);

  const loadPdf = useCallback((file: File) => {
    clearError();
    setState(prev => ({ ...prev, pdfFile: file }));
  }, []);

  const startProcessing = useCallback(async () => {
    const { pdfFile, employees } = state;
    if (!pdfFile || employees.length === 0) return;

    setState(prev => ({
      ...prev,
      step: 'processing',
      error: null,
      processingProgress: 0,
      processingTotal: 1,
      processingMessage: 'Starting…',
    }));

    try {
      const result = await processPdf(pdfFile, employees, (current, total, msg) => {
        setState(prev => ({
          ...prev,
          processingProgress: current,
          processingTotal: total,
          processingMessage: msg,
        }));
      });

      setState(prev => ({
        ...prev,
        step: 'results',
        matched: result.matched,
        unmatchedPages: result.unmatchedPages,
        unmatchedEmployees: result.unmatchedEmployees,
      }));
    } catch (err) {
      setError(`Processing failed: ${(err as Error).message}`);
      setState(prev => ({ ...prev, step: 'upload' }));
    }
  }, [state]);

  const clearExcel = useCallback(() => {
    setState(prev => ({ ...prev, excelFile: null, employees: [], error: null }));
  }, []);

  const clearPdf = useCallback(() => {
    setState(prev => ({ ...prev, pdfFile: null, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const canProcess = state.employees.length > 0 && state.pdfFile !== null;

  return { state, loadExcel, loadPdf, clearExcel, clearPdf, startProcessing, reset, canProcess };
}
