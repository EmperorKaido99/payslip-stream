import { Lock, Download, CheckCircle2, FileText } from 'lucide-react';
import { ProcessedFile } from '@/types/payslip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { downloadAllAsZip } from '@/lib/downloadUtils';

interface EncryptionModuleProps {
  processedFiles: ProcessedFile[];
  encryptionProgress: number;
  isEncryptionComplete: boolean;
  onStartEncryption: () => void;
}

export const EncryptionModule = ({
  processedFiles,
  encryptionProgress,
  isEncryptionComplete,
  onStartEncryption,
}: EncryptionModuleProps) => {
  const handleDownloadEncrypted = async () => {
    toast.success('Download started', {
      description: 'Your encrypted ZIP file is being prepared...',
    });
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    await downloadAllAsZip(processedFiles, true, `Encrypted_Payslips_${month}_${year}.zip`);
  };

  const getStatusBadge = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'encrypted':
        return <Badge className="bg-success hover:bg-success/80">Encrypted</Badge>;
      case 'ready':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const isEncrypting = encryptionProgress > 0 && !isEncryptionComplete;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full ${isEncryptionComplete ? 'bg-success/20' : 'bg-primary/20'} flex items-center justify-center`}>
            {isEncryptionComplete ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isEncryptionComplete ? 'Encryption Complete' : 'Encryption'}
            </CardTitle>
            <CardDescription className="text-base">
              {isEncryptionComplete
                ? `All ${processedFiles.length} files have been encrypted with employee IDs`
                : 'Secure PDFs with employee IDs as passwords'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Encryption Progress */}
        {isEncrypting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Encrypting files...</span>
              <span className="font-medium">{Math.round(encryptionProgress)}%</span>
            </div>
            <Progress value={encryptionProgress} className="h-2" />
          </div>
        )}

        {/* Files List */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="font-semibold">Encryption Key</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                        {file.status === 'encrypted' ? file.employeeId : '••••••'}
                      </code>
                    </TableCell>
                    <TableCell>{getStatusBadge(file.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {!isEncryptionComplete && !isEncrypting && (
            <Button className="gap-2" onClick={onStartEncryption}>
              <Lock className="w-4 h-4" />
              Encrypt All Files
            </Button>
          )}
          {isEncryptionComplete && (
            <Button className="gap-2" onClick={handleDownloadEncrypted}>
              <Download className="w-4 h-4" />
              Download Encrypted Files (.zip)
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
