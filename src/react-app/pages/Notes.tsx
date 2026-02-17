import { Card } from "@/react-app/components/ui/card";
import { Plus, FileText, Calendar } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/react-app/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export default function Notes() {
  const notes = useQuery(api.notes.list) ?? [];
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const [selectedId, setSelectedId] = useState<Id<"notes"> | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [localContent, setLocalContent] = useState("");

  const selectedNote = selectedId ? notes.find((n) => n._id === selectedId) : null;

  useEffect(() => {
    if (notes.length > 0 && selectedId === null) {
      setSelectedId(notes[0]._id);
    }
  }, [notes, selectedId]);

  useEffect(() => {
    if (selectedNote) {
      setLocalTitle(selectedNote.title);
      setLocalContent(selectedNote.content);
    }
  }, [selectedNote]);

  const handleNewNote = useCallback(async () => {
    const id = await createNote({});
    setSelectedId(id);
    setLocalTitle("");
    setLocalContent("");
  }, [createNote]);

  const syncTitle = useCallback(
    (title: string) => {
      if (selectedId) updateNote({ id: selectedId, title });
    },
    [selectedId, updateNote]
  );
  const syncContent = useCallback(
    (content: string) => {
      if (selectedId) updateNote({ id: selectedId, content });
    },
    [selectedId, updateNote]
  );

  return (
    <div className="h-full flex bg-background">
      <div className="w-80 border-r border-border bg-muted/30 p-4 space-y-2 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">All Notes</h2>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleNewNote}
            aria-label="New note"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {notes.map((note) => (
          <button
            type="button"
            key={note._id}
            onClick={() => setSelectedId(note._id)}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              selectedId === note._id
                ? "bg-background border-foreground/20 shadow-sm"
                : "bg-card border-border hover:bg-background/50"
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <h3 className="text-sm font-medium text-foreground flex-1 line-clamp-1">
                {note.title || "Untitled"}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {note.content || "No content yet"}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {selectedNote ? (
          <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div>
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={(e) => syncTitle(e.target.value)}
                className="w-full text-3xl font-semibold text-foreground bg-transparent border-0 focus:outline-none placeholder:text-muted-foreground mb-2"
                placeholder="Untitled"
              />
              <p className="text-sm text-muted-foreground">
                Created {new Date(selectedNote.createdAt).toLocaleDateString()}
              </p>
            </div>

            <Card className="p-6 bg-card border-border shadow-sm">
              <Textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                onBlur={(e) => syncContent(e.target.value)}
                className="min-h-[400px] border-0 focus-visible:ring-0 resize-none text-sm leading-relaxed"
                placeholder="Start typing... Use / for commands"
              />
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Press{" "}
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/ </kbd> for
                  commands •{" "}
                  <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">Cmd+B</kbd> for
                  bold
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
