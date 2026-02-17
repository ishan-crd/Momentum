## Momentum

A calm, minimal productivity app for everyday clarity and momentum.

### Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up Convex (database + auth)**
   - Run `npx convex dev` and sign in or create a Convex account.
   - When prompted, create a new project. This generates `convex/_generated` and links your app.
   - Copy the deployment URL and add it to a `.env.local` file:
     ```
     VITE_CONVEX_URL=https://your-deployment.convex.cloud
     ```
   - (Optional) For password auth, set JWT keys in the [Convex dashboard](https://dashboard.convex.dev) → Settings → Environment Variables. Run `node node_modules/@convex-dev/auth/scripts/generateKeys.mjs` and add `JWT_PRIVATE_KEY` and `JWKS`.
   - For AI features (break down tasks/goals, today’s focus, suggest next tasks), get a **free** [Google Gemini API key](https://aistudio.google.com/app/apikey) and add **`GEMINI_API_KEY`** in Convex Dashboard → Settings → Environment Variables. No credit card required.

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173. Use **Sign up** to create an account, then sign in. All data (notes, habits, tasks, goals) is stored in Convex and scoped to your user.

### Tech

- **Frontend:** React 19, Vite 7, Tailwind, Radix UI
- **Backend:** Convex (database, serverless functions)
- **Auth:** Convex Auth (email + password)
