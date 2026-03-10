import React, { useCallback, useState } from 'react';
import { FileSpreadsheet, FileText, Upload, CheckCircle2, AlertCircle, Users, X } from 'lucide-react';
import { Employee } from '../../types';

interface DropZoneProps {
  label: string;
  sublabel: string;
  accept: string;
  icon: React.ReactNode;
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;
  accentColor: string;
}

function DropZone({ label, sublabel, accept, icon, file, onFile, onClear, accentColor }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`relative rounded-2xl border-2 transition-all duration-200 ${
        dragging
          ? `border-dashed ${accentColor} bg-white/5`
          : file
          ? 'border-emerald-500/60 bg-emerald-950/20'
          : 'border-dashed border-white/15 hover:border-white/30 bg-white/3'
      }`}
      style={{ cursor: 'pointer' }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate text-sm">{file.name}</p>
            <p className="text-xs text-white/40 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClear(); }}
            className="w-8 h-8 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accentColor.includes('amber') ? 'bg-amber-500/15' : 'bg-blue-500/15'}`}>
            {icon}
          </div>
          <div>
            <p className="font-semibold text-white/90 text-sm">{label}</p>
            <p className="text-xs text-white/40 mt-1">{sublabel}</p>
          </div>
          <div className={`text-xs px-3 py-1.5 rounded-lg font-medium ${accentColor.includes('amber') ? 'bg-amber-500/15 text-amber-300' : 'bg-blue-500/15 text-blue-300'}`}>
            Click or drag & drop
          </div>
        </div>
      )}
    </div>
  );
}

interface UploadStepProps {
  excelFile: File | null;
  pdfFile: File | null;
  employees: Employee[];
  canProcess: boolean;
  error: string | null;
  onExcel: (f: File) => void;
  onPdf: (f: File) => void;
  onClearExcel: () => void;
  onClearPdf: () => void;
  onProcess: () => void;
}

export function UploadStep({
  excelFile, pdfFile, employees, canProcess, error,
  onExcel, onPdf, onClearExcel, onClearPdf, onProcess,
}: UploadStepProps) {
  return (
    <div className="space-y-8">
      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm font-medium text-white/70">Employee List</p>
          </div>
          <DropZone
            label="Upload Excel Sheet"
            sublabel=".xlsx, .xls, .csv — must have Name & Surname columns"
            accept=".xlsx,.xls,.csv"
            icon={<FileSpreadsheet className="w-7 h-7 text-amber-400" />}
            file={excelFile}
            onFile={onExcel}
            onClear={onClearExcel}
            accentColor="border-amber-400 text-amber-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm font-medium text-white/70">Bulk Payslips PDF</p>
          </div>
          <DropZone
            label="Upload Bulk PDF"
            sublabel=".pdf — all payslips merged into a single file"
            accept=".pdf"
            icon={<FileText className="w-7 h-7 text-blue-400" />}
            file={pdfFile}
            onFile={onPdf}
            onClear={onClearPdf}
            accentColor="border-blue-400 text-blue-400"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Employee Preview */}
      {employees.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white/80">Employees loaded</span>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-500/15 text-amber-300 rounded-full font-medium">
              {employees.length} found
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-2.5 text-white/35 font-medium text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-2.5 text-white/35 font-medium text-xs uppercase tracking-wider">Surname</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 50).map((emp, i) => (
                  <tr key={emp.id} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                    <td className="px-5 py-2.5 text-white/70">{emp.name}</td>
                    <td className="px-5 py-2.5 text-white/70">{emp.surname}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length > 50 && (
              <div className="px-5 py-3 text-xs text-white/30 text-center border-t border-white/5">
                + {employees.length - 50} more employees
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Button */}
      <div className="flex justify-end">
        <button
          disabled={!canProcess}
          onClick={onProcess}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            canProcess
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:-translate-y-0.5'
              : 'bg-white/8 text-white/25 cursor-not-allowed'
          }`}
        >
          <Upload className="w-4 h-4" />
          Match & Split Payslips
        </button>
      </div>
    </div>
  );
}
