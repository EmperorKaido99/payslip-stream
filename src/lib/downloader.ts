import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { MatchedPayslip } from '../types';

export function downloadSinglePayslip(payslip: MatchedPayslip): void {
  if (!payslip.pdfBytes) throw new Error('No PDF data available');
  const blob = new Blob([payslip.pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  saveAs(blob, payslip.fileName);
}

export async function downloadAllAsZip(
  payslips: MatchedPayslip[],
  zipName?: string
): Promise<void> {
  const zip = new JSZip();
  const ready = payslips.filter(p => p.status === 'ready' && p.pdfBytes);

  for (const p of ready) {
    zip.file(p.fileName, p.pdfBytes!);
  }

  const currentDate = new Date();
  const defaultName = `Payslips_${currentDate.toLocaleString('default', { month: 'long' })}_${currentDate.getFullYear()}.zip`;
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, zipName ?? defaultName);
}
