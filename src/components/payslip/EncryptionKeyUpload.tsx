import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProcessedFile } from '@/types/payslip';
import { sanitizeEmployeeId } from '@/lib/downloadUtils';

interface EncryptionKeyData {
  id_number: string;
  name?: string;
  surname?: string;
}

interface EncryptionKeyUploadProps {
  processedFiles: ProcessedFile[];
  onKeysValidated: (keys: EncryptionKeyData[]) => void;
  validatedKeys: EncryptionKeyData[] | null;
}

export const EncryptionKeyUpload = ({
  processedFiles,
  onKeysValidated,
  validatedKeys,
}: EncryptionKeyUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedKeys, setParsedKeys] = useState<EncryptionKeyData[] | null>(validatedKeys);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateParseExcel = (file: File): EncryptionKeyData[] => {
    // In production, this would use xlsx library to parse the actual file
    // For demo, we'll generate keys matching the processed files
    // IMPORTANT: Sanitize all IDs to ensure consistency
    return processedFiles.map((pf) => ({
      id_number: sanitizeEmployeeId(pf.employeeId),
      name: pf.employeeName.split(' ')[0],
      surname: pf.employeeName.split(' ')[1] || '',
    }));
  };

  const validateKeys = (keys: EncryptionKeyData[]) => {
    const errors: string[] = [];
    
    // Sanitize all IDs for comparison
    const sanitizedKeyIds = new Set(keys.map(k => sanitizeEmployeeId(k.id_number)));
    const sanitizedFileIds = new Set(processedFiles.map(f => sanitizeEmployeeId(f.employeeId)));

    console.log('Validating encryption keys...');
    console.log('Key IDs:', Array.from(sanitizedKeyIds));
    console.log('File IDs:', Array.from(sanitizedFileIds));

    // Check for missing keys (files without matching encryption key)
    processedFiles.forEach(file => {
      const sanitizedFileId = sanitizeEmployeeId(file.employeeId);
      if (!sanitizedKeyIds.has(sanitizedFileId)) {
        errors.push(`Missing encryption key for: ${file.employeeName} (ID: ${sanitizedFileId})`);
      }
    });

    // Check for extra keys (keys without matching files)
    keys.forEach(key => {
      const sanitizedKeyId = sanitizeEmployeeId(key.id_number);
      if (!sanitizedFileIds.has(sanitizedKeyId)) {
        errors.push(`Extra key found: ${sanitizedKeyId} (no matching payslip)`);
      }
    });

    console.log(`Validation complete: ${errors.length} errors found`);
    return errors;
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processedFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processedFiles]);

  const processFile = (file: File) => {
    console.log('Processing encryption key file:', file.name);
    setUploadedFile(file);
    
    const keys = simulateParseExcel(file);
    console.log('Parsed keys:', keys);
    
    const errors = validateKeys(keys);
    setParsedKeys(keys);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      console.log('✓ All keys validated successfully');
      onKeysValidated(keys);
    } else {
      console.warn('✗ Key validation failed:', errors);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setParsedKeys(null);
    setValidationErrors([]);
  };

  const matchedCount = parsedKeys 
    ? parsedKeys.filter(k => {
        const sanitizedKeyId = sanitizeEmployeeId(k.id_number);
        return processedFiles.some(f => sanitizeEmployeeId(f.employeeId) === sanitizedKeyId);
      }).length 
    : 0;

  const isFullyMatched = parsedKeys && validationErrors.length === 0 && matchedCount === processedFiles.length;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${isFullyMatched ? 'bg-success/20' : 'bg-primary/20'} flex items-center justify-center`}>
            {isFullyMatched ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">Upload Encryption Keys</CardTitle>
            <CardDescription className="text-base">
              Upload the Excel file containing employee ID numbers to use as PDF passwords
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your encryption key Excel file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              File must contain an <code className="px-1 py-0.5 bg-muted rounded">id_number</code> column
            </p>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
              />
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Validation Status */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {isFullyMatched && (
              <Alert className="border-success/50 bg-success/10">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  All {matchedCount} employee IDs matched successfully! Ready to encrypt.
                </AlertDescription>
              </Alert>
            )}

            {/* Matched Keys Preview */}
            {parsedKeys && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Encryption Key Mapping</span>
                    <Badge variant={isFullyMatched ? "default" : "outline"}>
                      {matchedCount} / {processedFiles.length} matched
                    </Badge>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card">
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>ID (Password)</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedFiles.map((file) => {
                        const sanitizedFileId = sanitizeEmployeeId(file.employeeId);
                        const matchedKey = parsedKeys.find(k => 
                          sanitizeEmployeeId(k.id_number) === sanitizedFileId
                        );
                        return (
                          <TableRow key={file.id}>
                            <TableCell className="font-medium">{file.employeeName}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                {matchedKey ? sanitizeEmployeeId(matchedKey.id_number) : '—'}
                              </code>
                            </TableCell>
                            <TableCell>
                              {matchedKey ? (
                                <Badge className="bg-success hover:bg-success/80">Matched</Badge>
                              ) : (
                                <Badge variant="destructive">Not Found</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
