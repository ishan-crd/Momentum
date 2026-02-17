import { Plus } from "lucide-react";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

type Command = "task" | "note" | "reminder" | "habit" | null;

const COMMAND_FORMATS: Record<NonNullable<Command>, string> = {
  task: "title: your task  (optional: due:YYYY-MM-DD, priority:low|medium|high)",
  note: "heading: note title  text: note body",
  reminder: "title: reminder  due: YYYY-MM-DD",
  habit: "name: habit name",
};

const BLANK_HINT =
  "Type /task, /note, /reminder, or /habit then add key:value pairs. Press Enter to add.";

function parseKeyValues(rest: string): Record<string, string> {
  const out: Record<string, string> = {};
  const regex = /(\w+):\s*(.+?)(?=\s\w+:\s*|$)/gs;
  let m = regex.exec(rest);
  while (m !== null) {
    out[m[1].toLowerCase()] = m[2].trim();
    m = regex.exec(rest);
  }
  return out;
}

function getCommand(input: string): Command {
  const t = input.trim();
  if (!t.startsWith("/")) return null;
  const afterSlash = t.slice(1).split(/\s/)[0]?.toLowerCase() ?? "";
  if (afterSlash === "task") return "task";
  if (afterSlash === "note") return "note";
  if (afterSlash === "reminder") return "reminder";
  if (afterSlash === "habit") return "habit";
  return null;
}

function getRestAfterCommand(input: string): string {
  const t = input.trim();
  if (!t.startsWith("/")) return "";
  const space = t.indexOf(" ", 1);
  if (space === -1) return "";
  return t.slice(space + 1).trim();
}

export default function QuickAdd() {
  const [value, setValue] = useState("");
  const createTask = useMutation(api.tasks.create);
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const createHabit = useMutation(api.habits.create);

  const command = useMemo(() => getCommand(value), [value]);

  const hint = useMemo(() => {
    if (!value.trim()) return BLANK_HINT;
    if (command) return COMMAND_FORMATS[command];
    return BLANK_HINT;
  }, [value, command]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !value.trim()) return;

    const cmd = getCommand(value);
    const restStr = getRestAfterCommand(value);

    if (!cmd) {
      const trimmed = value.trim();
      if (trimmed.startsWith("/")) return;
      await createTask({ title: trimmed, status: "todo" });
      setValue("");
      return;
    }

    const params = parseKeyValues(restStr);

    if (cmd === "task") {
      const title = params.title ?? (restStr || "New task");
      await createTask({
        title,
        status: "todo",
        dueDate: params.due ?? undefined,
        priority: (params.priority as "low" | "medium" | "high") ?? undefined,
      });
      setValue("");
      return;
    }

    if (cmd === "reminder") {
      const title = params.title ?? (restStr || "Reminder");
      await createTask({
        title,
        status: "todo",
        dueDate: params.due ?? undefined,
      });
      setValue("");
      return;
    }

    if (cmd === "habit") {
      const name = params.name ?? (restStr || "New habit");
      if (!name) return;
      await createHabit({ name });
      setValue("");
      return;
    }

    if (cmd === "note") {
      const heading = params.heading ?? "";
      const text = params.text ?? "";
      const id = await createNote({});
      await updateNote({ id, title: heading, content: text });
      setValue("");
      return;
    }

    setValue("");
  };

  return (
    <Card className="border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Plus className="mt-2.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Quick add... (e.g. /task title: Buy milk)"
            className="border-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
            aria-describedby="quick-add-hint"
          />
          <p
            id="quick-add-hint"
            className="mt-2 text-xs text-muted-foreground"
          >
            {value.trim() ? (
              <>
                <span className="font-medium text-foreground">Format: </span>
                {hint}
              </>
            ) : (
              hint
            )}
          </p>
          {value.trim() && (
            <p className="mt-1 text-xs text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to add
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
