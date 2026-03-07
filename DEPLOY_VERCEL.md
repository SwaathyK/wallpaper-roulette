# Deploy Wallpaper Roulette to Vercel

## Option A: Deploy from GitHub (recommended)

1. **Sign in to Vercel**  
   Go to [vercel.com](https://vercel.com) and sign in with your **GitHub** account.

2. **Import the repo**  
   - Click **Add New…** → **Project**.  
   - Find **SwaathyK/wallpaper-roulette** in the list and click **Import**.

3. **Configure (optional)**  
   - **Framework Preset:** Next.js (auto-detected).  
   - **Root Directory:** leave as `.` (repo root).  
   - **Build Command:** `npm run build` (default).  
   - **Output Directory:** leave default.  
   - No environment variables needed for this app.

4. **Deploy**  
   Click **Deploy**. Vercel will build and give you a URL like `wallpaper-roulette.vercel.app`.

5. **Later updates**  
   Push to `main` on GitHub; Vercel will redeploy automatically.

---

## Option B: Deploy with Vercel CLI

```bash
cd "/Users/swaathykumaran/Documents/Zero to one 2/color-roulette"
npm i -g vercel
vercel
```

Follow the prompts (link to existing project or create new one). Then:

```bash
vercel --prod
```

to deploy to production.
