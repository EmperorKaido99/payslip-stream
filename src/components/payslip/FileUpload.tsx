import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FileUploadProps {
  title: string;
  description: string;
  stepNumber: number;
  accept: string;
  acceptedFormats: string;
  fileType: 'excel' | 'pdf';
  uploadedFile: { name: string; size: number } | null;
  onUpload: (file: File) => void;
  onClear?: () => void;
}

export const FileUpload = ({
  title,
  description,
  stepNumber,
  accept,
  acceptedFormats,
  fileType,
  uploadedFile,
  onUpload,
  onClear,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'excel') {
      if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
        setError('Invalid file format. Please upload .xlsx, .xls, or .csv');
        return false;
      }
    } else if (fileType === 'pdf') {
      if (extension !== 'pdf') {
        setError('Invalid file format. Please upload a .pdf file');
        return false;
      }
    }
    
    setError(null);
    return true;
  }, [fileType]);

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      setIsValidating(true);
      // Simulate validation delay
      setTimeout(() => {
        setIsValidating(false);
        onUpload(file);
      }, 800);
    }
  }, [validateFile, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const FileIcon = fileType === 'excel' ? FileSpreadsheet : FileText;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {stepNumber}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {uploadedFile ? (
          <div className="border-2 border-success/30 bg-success/5 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Uploaded</span>
                </div>
                {onClear && (
                  <Button variant="ghost" size="icon" onClick={onClear} className="text-muted-foreground hover:text-destructive">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer',
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30',
              error && 'border-destructive bg-destructive/5'
            )}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
              id={`file-upload-${fileType}`}
            />
            
            {isValidating ? (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground">Validating file...</p>
              </div>
            ) : (
              <>
                <Upload className={cn('w-12 h-12 mx-auto mb-4', error ? 'text-destructive' : 'text-muted-foreground')} />
                <p className="font-medium text-foreground mb-1">Drop your file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                
                <label htmlFor={`file-upload-${fileType}`}>
                  <Button variant="outline" className="pointer-events-none">
                    Browse Files
                  </Button>
                </label>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: {acceptedFormats}
                </p>
                
                {error && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
