import { Card } from '@/react-app/components/ui/card';
import { Plus, FileText, Calendar } from 'lucide-react';
import { Button } from '@/react-app/components/ui/button';
import { useState } from 'react';
import { Textarea } from '@/react-app/components/ui/textarea';

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const stubNotes: Note[] = [
  {
    id: 1,
    title: 'Product Ideas',
    content: 'Brainstorming features for the next release:\n• User dashboard improvements\n• Advanced analytics\n• Mobile app considerations',
    createdAt: '2024-01-10'
  },
  {
    id: 2,
    title: 'Meeting Notes - Team Sync',
    content: 'Key takeaways from today\'s meeting:\n• Launch date confirmed for Feb 1\n• Need to finalize marketing materials\n• Schedule follow-up with design team',
    createdAt: '2024-01-09'
  },
  {
    id: 3,
    title: 'Learning Resources',
    content: 'Articles to read:\n• Advanced TypeScript patterns\n• React performance optimization\n• Design system best practices',
    createdAt: '2024-01-08'
  },
];

function newBlankNote(notes: Note[]): Note {
  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  return {
    id: nextId,
    title: '',
    content: '',
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export default function Notes() {
  const [notes, setNotes] = useState(stubNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);

  const handleNewNote = () => {
    const note = newBlankNote(notes);
    setNotes((prev) => [note, ...prev]);
    setSelectedNote(note);
  };

  const updateSelectedNote = (updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, ...updates };
    setSelectedNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? updated : n)));
  };

  return (
    <div className="h-full flex bg-background">
      {/* Notes List */}
      <div className="w-80 border-r border-border bg-muted/30 p-4 space-y-2 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">All Notes</h2>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleNewNote} aria-label="New note">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {notes.map(note => (
          <button
            type="button"
            key={note.id}
            onClick={() => setSelectedNote(note)}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              selectedNote?.id === note.id
                ? 'bg-background border-foreground/20 shadow-sm'
                : 'bg-card border-border hover:bg-background/50'
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <h3 className="text-sm font-medium text-foreground flex-1 line-clamp-1">
                {note.title || 'Untitled'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {note.content || 'No content yet'}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>

      {/* Note Editor */}
      <div className="flex-1 overflow-auto">
        {selectedNote ? (
          <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div>
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateSelectedNote({ title: e.target.value })}
                className="w-full text-3xl font-semibold text-foreground bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground mb-2"
                placeholder="Untitled"
              />
              <p className="text-sm text-muted-foreground">
                Created {new Date(selectedNote.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Card className="p-6 bg-card border-border shadow-sm">
              <Textarea
                value={selectedNote.content}
                onChange={(e) => updateSelectedNote({ content: e.target.value })}
                className="min-h-[400px] border-0 focus-visible:ring-0 resize-none text-sm leading-relaxed"
                placeholder="Start typing... Use / for commands"
              />
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">/ </kbd> 
                  for commands • <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Cmd+B</kbd> for bold
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
