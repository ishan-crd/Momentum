# Momentum — Project Story

***Momentum*** was inspired by the everyday struggle to stay focused and productive. Most people start their day with good intentions but end it feeling unaccomplished because they either have too many tasks or lack a clear way to prioritize. We wanted to create a tool that emphasizes clarity over complexity and helps anyone plan their day with purpose rather than overwhelm.

---

## What We Built

Momentum is a clean productivity web application designed to be used every day by working professionals, students, and freelancers. It helps users identify their three most important tasks for the day, track progress on meaningful goals, maintain habits, and visually see weekly accomplishments. The UI draws from a calm, structured style that makes planning feel intuitive and distraction-free.

### Key Features

- **Daily Focus Dashboard** — The central screen shows the top three priorities for the day and encourages users to stay on target.
- **Task Workflow** — A simple task board (To Do → In Progress → Completed) with drag-and-drop helps users manage tasks without clutter.
- **Current Mission** — One highlighted “mission” from the top three keeps focus on the single most important thing.
- **Weekly Progress** — Users track how many major tasks they completed this week and see a visual indicator of their weekly goal completion.
- **Goals with Linked Tasks** — Goals can be tied to concrete tasks so progress is measurable.
- **Habits** — Daily habit tracking with weekly consistency metrics.
- **Weekly Review** — A dedicated reflection flow: what went well, what to improve, and focus areas for next week, with an AI-generated final review.

---

## AI Reasoning & Smart Features

We integrated **AI** so the app doesn’t just store tasks—it helps users think and plan. All AI runs in **Convex serverless actions** using the **Google Gemini API** (free tier), with no API keys on the client.

### What the AI Does

1. **Break down tasks** — From the task board, users can select “Break down” on any task. The AI turns one vague task into 3–5 concrete subtasks (e.g. “Launch marketing” → “Draft email copy”, “Set up landing page”, “Schedule send”). Users can add some or all suggestions to their list in one click.

2. **Break down goals into tasks** — On the Goals page, “Suggest tasks” does the same for a goal: the AI proposes 3–5 actionable tasks to move that goal forward, which users can add to their task list.

3. **Today’s focus** — The Today page has a “Suggest focus” button. The AI receives the user’s top tasks, overdue items, and an optional active goal, then returns **one short sentence** (e.g. “Focus on finishing the design system doc, then block an hour for the piano piece.”) so the day starts with a single, clear intention.

4. **Weekly reflection analysis** — In Weekly Review, after users fill in three prompts (what went well, what could be improved, focus for next week), they click **Analyze**. The AI reads the reflection and writes a **short paragraph** that summarizes wins, acknowledges growth areas, and reinforces focus for the coming week. This gives users a concise “final review” without extra effort.

### How We Built the AI Layer

- **Single `chat()` helper** in `convex/ai.ts` that calls Gemini’s `generateContent` API with a system prompt and user content. We use **multiple model fallbacks** (e.g. `gemini-2.5-flash`, then `gemini-2.0-flash`) to handle rate limits and availability.
- **Structured prompts** for each action: clear instructions, output format (e.g. “one per line”, “one short paragraph”), and length so responses are predictable and useful.
- **Response handling** — We discovered that Gemini can return the full reply in **multiple `parts`**. We now concatenate all parts so the full paragraph (e.g. for reflection analysis) is never truncated. This fixed issues where only the first sentence appeared.
- **Cost and safety** — We cap `maxOutputTokens` per call, use moderate temperature, and keep all logic and keys on the server so the front end stays simple and secure.

### Why AI Fits the Product

The goal of Momentum is **clarity over complexity**. AI supports that by:

- Reducing the “blank page” problem (suggesting subtasks and next steps).
- Turning many inputs (tasks, overdue, goals) into one clear “today’s focus” sentence.
- Turning a few reflection bullets into a coherent, encouraging summary.

So the app stays minimal, but feels thoughtful and adaptive.

---

## How We Built the Project

- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS, Radix UI. Single-page app with client-side routing (Today, Tasks, Goals, Notes, Habits, Weekly Review, Settings).
- **Backend & data:** Convex — real-time database, serverless queries/mutations/actions, and auth. All tasks, goals, habits, and notes are stored in Convex and scoped per user.
- **Auth:** Convex Auth with email + password; JWT keys configured in the Convex dashboard.
- **AI:** Convex actions call the Gemini API from the server; `GEMINI_API_KEY` is set in Convex environment variables so it never touches the client.

The codebase is organized with reusable UI components (e.g. dialogs, cards, forms), page-level components for each section, and a single `convex/ai.ts` module for all Gemini-backed actions.

---

## What We Learned

We learned that productivity tools should reduce friction and decision overhead rather than add complexity. Real progress often feels mathematical in its simplicity. For example, completing just three meaningful tasks each day results in:

\[
3 \times 7 = 21 \text{ significant tasks completed in a week}
\]

This kind of consistent output can meaningfully improve how someone works or studies. We also learned that **AI works best when it has a narrow job** (one sentence, one list, one paragraph) and when we handle API quirks (like multi-part responses) so the user always sees the full answer.

---

## Challenges

- **Resisting feature creep** — It was tempting to add advanced analytics or collaboration, but we kept the scope on daily clarity and weekly reflection so the app stays focused.
- **AI response length** — Early on, the weekly “Analyze” output was truncated to one sentence. Fixing this required (1) joining all response parts from the Gemini API and (2) clearer prompts and token limits so the model produces a full short paragraph.
- **Staying on the free tier** — We use Gemini’s free tier with model fallbacks and retries (including backoff on 429) so the app remains usable without paid credits.

---

## Final Thoughts

Momentum is meant to be a companion you open each morning and close with satisfaction at night. It does not try to solve every productivity problem but focuses on what matters most: **clarity**, **simplicity**, and **tangible progress**—with a touch of AI to reduce friction and reinforce that focus.
