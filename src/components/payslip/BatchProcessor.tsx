import { usePayslipWorkflow } from '@/hooks/usePayslipWorkflow';
import { Sidebar } from './Sidebar';
import { StepIndicator } from './StepIndicator';
import { FileUpload } from './FileUpload';
import { EmployeePreview } from './EmployeePreview';
import { ProcessingScreen } from './ProcessingScreen';
import { ResultsScreen } from './ResultsScreen';
import { EncryptionModule } from './EncryptionModule';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const BatchProcessor = () => {
  const {
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
  } = usePayslipWorkflow();

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'upload-database':
        return (
          <div className="space-y-6">
            <FileUpload
              title="Upload Employee Database"
              description="Upload your employee data in Excel (.xlsx, .xls) or CSV (.csv) format"
              stepNumber={1}
              accept=".xlsx,.xls,.csv"
              acceptedFormats=".xlsx, .xls, .csv"
              fileType="excel"
              uploadedFile={state.excelFile}
              onUpload={uploadExcel}
            />
            
            <EmployeePreview employees={state.employees} />
            
            <div className="flex justify-end">
              <Button
                disabled={!canProceedToPdf}
                onClick={() => setStep('upload-pdf')}
                className="gap-2"
              >
                Continue to PDF Upload
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 'upload-pdf':
        return (
          <div className="space-y-6">
            <FileUpload
              title="Upload PDFs"
              description="Upload your payslip PDF document"
              stepNumber={2}
              accept=".pdf"
              acceptedFormats=".pdf"
              fileType="pdf"
              uploadedFile={state.pdfFile}
              onUpload={uploadPdf}
            />
            
            {state.pdfFile && (
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">PDF Details</CardTitle>
                      <CardDescription>Document ready for processing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{state.pdfFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Detected pages: {state.employees.length} (matched to employee count)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-success font-medium">Ready to process</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload-database')}>
                Back
              </Button>
              <Button
                disabled={!canProcess}
                onClick={startProcessing}
                className="gap-2"
              >
                Process Files
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <ProcessingScreen
            progress={state.processingProgress}
            type="processing"
            onCancel={resetWorkflow}
          />
        );

      case 'results':
        return (
          <ResultsScreen
            processedFiles={state.processedFiles}
            employeeCount={state.employees.length}
            onProceedToEncryption={() => setStep('encryption')}
          />
        );

      case 'encryption':
        return state.encryptionProgress > 0 && !state.isEncryptionComplete ? (
          <ProcessingScreen
            progress={state.encryptionProgress}
            type="encryption"
          />
        ) : (
          <EncryptionModule
            processedFiles={state.processedFiles}
            encryptionProgress={state.encryptionProgress}
            isEncryptionComplete={state.isEncryptionComplete}
            onStartEncryption={startEncryption}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLoadSample={loadSampleData} onReset={resetWorkflow} />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Batch Processing</h1>
            <p className="text-muted-foreground mt-1">
              Upload, encrypt, and distribute payslips in three simple steps
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={state.currentStep}
            isProcessingComplete={state.isProcessingComplete}
            isEncryptionComplete={state.isEncryptionComplete}
          />

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
};
