import { CheckCircle2, Download, FileText, Lock, ArrowRight } from 'lucide-react';
import { ProcessedFile } from '@/types/payslip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { downloadSingleFile, downloadAllAsZip } from '@/lib/downloadUtils';

interface ResultsScreenProps {
  processedFiles: ProcessedFile[];
  employeeCount: number;
  onProceedToEncryption: () => void;
}

export const ResultsScreen = ({ processedFiles, employeeCount, onProceedToEncryption }: ResultsScreenProps) => {
  const handleDownloadAll = async () => {
    toast.success('Download started', {
      description: 'Your ZIP file is being prepared...',
    });
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    await downloadAllAsZip(processedFiles, false, `Payslips_${month}_${year}.zip`);
  };

  const handleDownloadSingle = (file: ProcessedFile) => {
    toast.success(`Downloading ${file.fileName}`);
    downloadSingleFile(file, false);
  };

  const getStatusBadge = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-success hover:bg-success/80">Ready</Badge>;
      case 'encrypted':
        return <Badge className="bg-primary hover:bg-primary/80">Encrypted</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-warning/20 text-warning-foreground">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <div>
            <CardTitle className="text-2xl">Processing Complete</CardTitle>
            <CardDescription className="text-base">
              Successfully processed {employeeCount} employees from {processedFiles.length} PDF pages
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Files Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="font-semibold">Employee ID</TableHead>
                  <TableHead className="font-semibold">Page #</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
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
                    <TableCell className="font-mono text-sm">{file.employeeId}</TableCell>
                    <TableCell>{file.pageNumber}</TableCell>
                    <TableCell>{getStatusBadge(file.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary hover:text-primary/80"
                        onClick={() => handleDownloadSingle(file)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button variant="outline" className="gap-2" onClick={handleDownloadAll}>
            <Download className="w-4 h-4" />
            Download All as ZIP
          </Button>
          <Button className="gap-2" onClick={onProceedToEncryption}>
            <Lock className="w-4 h-4" />
            Proceed to Encryption
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
