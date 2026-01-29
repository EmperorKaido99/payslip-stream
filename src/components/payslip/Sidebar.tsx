import { Zap, FileStack, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onReset: () => void;
}

export const Sidebar = ({ onReset }: SidebarProps) => {
  return (
    <div className="w-56 bg-sidebar text-sidebar-foreground flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <Zap className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg">PaySync</h1>
          <p className="text-xs text-sidebar-foreground/70">Batch Processor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <FileStack className="w-5 h-5" />
          Batch Processing
        </Button>
      </nav>

      {/* Actions */}
      <div className="p-3 space-y-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5" />
          Reset Workflow
        </Button>
      </div>
    </div>
  );
};
