import { Plus } from 'lucide-react';
import { Card } from '@/react-app/components/ui/card';
import { Input } from '@/react-app/components/ui/input';
import { useState } from 'react';

export default function QuickAdd() {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      // Handle adding task
      setValue('');
    }
  };

  return (
    <Card className="p-4 bg-card border-border shadow-sm">
      <div className="flex items-center gap-3">
        <Plus className="h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick add... (try /task, /note, /reminder, /habit)"
          className="flex-1 border-0 focus-visible:ring-0 shadow-none text-sm placeholder:text-muted-foreground/60"
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground pl-8">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd> to add
      </div>
    </Card>
  );
}
