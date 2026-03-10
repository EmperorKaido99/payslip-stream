import { Zap, RotateCcw } from 'lucide-react';
import { usePayslipProcessor } from '../hooks/usePayslipProcessor';
import { UploadStep } from './steps/UploadStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ResultsStep } from './steps/ResultsStep';

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'processing', label: 'Processing' },
  { id: 'results', label: 'Results' },
];

export function PayslipApp() {
  const {
    state, loadExcel, loadPdf, clearExcel, clearPdf, startProcessing, reset, canProcess,
  } = usePayslipProcessor();

  const currentStepIndex = STEPS.findIndex(s => s.id === state.step);

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white flex" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/6 bg-[#0b0d12]">
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3 border-b border-white/6">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">PaySync</p>
            <p className="text-white/35 text-xs">Payslip Splitter</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <div className="px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-300">Batch Processing</span>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/6">
          <button
            onClick={reset}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/6 text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-white/6 flex-shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight">Batch Payslip Processor</h1>
          <p className="text-white/35 text-sm mt-0.5">
            Upload your employee list and bulk PDF — we'll match, split and rename each payslip.
          </p>
        </header>

        {/* Step indicator */}
        <div className="px-8 py-5 border-b border-white/6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isDone = idx < currentStepIndex;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-black'
                        : isActive
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/8 text-white/25'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : isDone ? 'text-white/50' : 'text-white/25'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-16 h-px transition-colors ${isDone ? 'bg-emerald-500/40' : 'bg-white/8'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          <div className="max-w-3xl">
            {state.step === 'upload' && (
              <UploadStep
                excelFile={state.excelFile}
                pdfFile={state.pdfFile}
                employees={state.employees}
                canProcess={canProcess}
                error={state.error}
                onExcel={loadExcel}
                onPdf={loadPdf}
                onClearExcel={clearExcel}
                onClearPdf={clearPdf}
                onProcess={startProcessing}
              />
            )}
            {state.step === 'processing' && (
              <ProcessingStep
                progress={state.processingProgress}
                total={state.processingTotal}
                message={state.processingMessage}
              />
            )}
            {state.step === 'results' && (
              <ResultsStep
                matched={state.matched}
                unmatchedPages={state.unmatchedPages}
                unmatchedEmployees={state.unmatchedEmployees}
                onReset={reset}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
