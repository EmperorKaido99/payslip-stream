import { useState } from 'react';
import {
  CheckCircle2, Download, FileText, AlertTriangle, ChevronDown, ChevronUp, Archive
} from 'lucide-react';
import { MatchedPayslip, UnmatchedPage, Employee } from '../../types';
import { downloadSinglePayslip, downloadAllAsZip } from '../../lib/downloader';

interface ResultsStepProps {
  matched: MatchedPayslip[];
  unmatchedPages: UnmatchedPage[];
  unmatchedEmployees: Employee[];
  onReset: () => void;
}

export function ResultsStep({ matched, unmatchedPages, unmatchedEmployees, onReset }: ResultsStepProps) {
  const [showUnmatched, setShowUnmatched] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  const ready = matched.filter(m => m.status === 'ready');
  const failed = matched.filter(m => m.status === 'failed');

  const handleDownloadOne = async (payslip: MatchedPayslip) => {
    setDownloading(payslip.employee.id);
    try {
      downloadSinglePayslip(payslip);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setDownloading(null), 800);
  };

  const handleDownloadAll = async () => {
    setZipping(true);
    try {
      await downloadAllAsZip(ready);
    } catch (e) {
      console.error(e);
    }
    setZipping(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/20 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{ready.length}</p>
          <p className="text-xs text-emerald-300/60 mt-1 font-medium uppercase tracking-wider">Matched</p>
        </div>
        <div className="rounded-2xl bg-amber-950/30 border border-amber-500/20 p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{unmatchedPages.length}</p>
          <p className="text-xs text-amber-300/60 mt-1 font-medium uppercase tracking-wider">Unmatched pages</p>
        </div>
        <div className="rounded-2xl bg-white/3 border border-white/8 p-4 text-center">
          <p className="text-3xl font-bold text-white/60">{unmatchedEmployees.length}</p>
          <p className="text-xs text-white/30 mt-1 font-medium uppercase tracking-wider">Not found</p>
        </div>
      </div>

      {/* Download all */}
      {ready.length > 0 && (
        <button
          onClick={handleDownloadAll}
          disabled={zipping}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Archive className="w-4 h-4" />
          {zipping ? 'Preparing ZIP…' : `Download All ${ready.length} Payslips as ZIP`}
        </button>
      )}

      {/* Matched files table */}
      {ready.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white/80">Successfully matched</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">Employee</th>
                  <th className="text-left px-5 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">Period</th>
                  <th className="text-left px-5 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">Page</th>
                  <th className="text-right px-5 py-3 text-white/35 font-medium text-xs uppercase tracking-wider">File</th>
                </tr>
              </thead>
              <tbody>
                {ready.map((p, i) => (
                  <tr key={p.employee.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <span className="font-medium text-white/80">{p.employee.name} {p.employee.surname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/50">{p.dateString}</td>
                    <td className="px-5 py-3 text-white/40 font-mono text-xs">{p.pageNumbers.join(', ')}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDownloadOne(p)}
                        disabled={downloading === p.employee.id}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 text-white/70 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        {downloading === p.employee.id ? '…' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 overflow-hidden">
          <div className="px-5 py-3.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">{failed.length} failed to extract</span>
          </div>
          <div className="px-5 pb-4 space-y-1.5">
            {failed.map(f => (
              <p key={f.employee.id} className="text-xs text-red-300/60">
                {f.employee.name} {f.employee.surname}: {f.error}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched details (collapsible) */}
      {(unmatchedPages.length > 0 || unmatchedEmployees.length > 0) && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 overflow-hidden">
          <button
            className="w-full px-5 py-3.5 flex items-center justify-between text-left"
            onClick={() => setShowUnmatched(v => !v)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">
                {unmatchedPages.length > 0 && `${unmatchedPages.length} PDF pages not matched`}
                {unmatchedPages.length > 0 && unmatchedEmployees.length > 0 && ' · '}
                {unmatchedEmployees.length > 0 && `${unmatchedEmployees.length} employees not found in PDF`}
              </span>
            </div>
            {showUnmatched ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
          </button>

          {showUnmatched && (
            <div className="px-5 pb-5 space-y-4 border-t border-amber-500/10">
              {unmatchedEmployees.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider font-medium mb-2">Employees not found in PDF</p>
                  <div className="space-y-1">
                    {unmatchedEmployees.map(e => (
                      <p key={e.id} className="text-sm text-amber-300/70">
                        {e.name} {e.surname}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {unmatchedPages.length > 0 && (
                <div>
                  <p className="text-xs text-amber-300/60 uppercase tracking-wider font-medium mb-2">Unmatched PDF pages</p>
                  <div className="space-y-1.5">
                    {unmatchedPages.map(p => (
                      <div key={p.pageNumber} className="flex gap-3 text-xs">
                        <span className="text-amber-300/40 font-mono flex-shrink-0">p.{p.pageNumber}</span>
                        <span className="text-amber-300/50 truncate">{p.textPreview || '(no text extracted — may be scanned image)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Start over */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4"
        >
          Process another batch
        </button>
      </div>
    </div>
  );
}
