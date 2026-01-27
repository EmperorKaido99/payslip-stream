import { Employee } from '@/types/payslip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface EmployeePreviewProps {
  employees: Employee[];
}

export const EmployeePreview = ({ employees }: EmployeePreviewProps) => {
  if (employees.length === 0) return null;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Employee Database Preview</CardTitle>
            <CardDescription>{employees.length} employees found</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Surname</TableHead>
                <TableHead className="font-semibold">ID Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.slice(0, 5).map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.surname}</TableCell>
                  <TableCell className="font-mono text-sm">{employee.id_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {employees.length > 5 && (
            <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/30 border-t">
              ... and {employees.length - 5} more employees
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
