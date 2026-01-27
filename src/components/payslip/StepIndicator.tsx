import { FileSpreadsheet, FileText, Send, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowStep } from '@/types/payslip';

interface Step {
  id: WorkflowStep;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 'upload-database', label: 'Upload Database', icon: <FileSpreadsheet className="w-5 h-5" /> },
  { id: 'upload-pdf', label: 'Upload PDFs', icon: <FileText className="w-5 h-5" /> },
  { id: 'processing', label: 'Process', icon: <Send className="w-5 h-5" /> },
  { id: 'encryption', label: 'Encrypted', icon: <Lock className="w-5 h-5" /> },
];

interface StepIndicatorProps {
  currentStep: WorkflowStep;
  isProcessingComplete: boolean;
  isEncryptionComplete: boolean;
}

export const StepIndicator = ({ currentStep, isProcessingComplete, isEncryptionComplete }: StepIndicatorProps) => {
  const getStepStatus = (stepId: WorkflowStep) => {
    const stepOrder: WorkflowStep[] = ['upload-database', 'upload-pdf', 'processing', 'results', 'encryption'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId === 'encryption' ? 'encryption' : stepId);
    
    if (stepId === 'encryption' && isEncryptionComplete) return 'complete';
    if (stepId === 'processing' && (isProcessingComplete || currentStep === 'results' || currentStep === 'encryption')) return 'complete';
    if (stepId === 'upload-pdf' && currentIndex > 1) return 'complete';
    if (stepId === 'upload-database' && currentIndex > 0) return 'complete';
    if (stepId === currentStep || (stepId === 'processing' && currentStep === 'results')) return 'active';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  status === 'complete' && 'bg-success text-success-foreground',
                  status === 'active' && 'bg-primary text-primary-foreground',
                  status === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {status === 'complete' ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  'text-sm mt-2 font-medium',
                  status === 'active' && 'text-primary',
                  status === 'complete' && 'text-success',
                  status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-24 h-0.5 mx-4 mt-[-20px]',
                  getStepStatus(steps[index + 1].id) !== 'pending' ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
