# Push Wallpaper Roulette to GitHub

## 1. Create a new repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** e.g. `wallpaper-roulette` (or `color-roulette`)
3. **Description (optional):** e.g. "Spin a color wheel, collect hues, generate gradient wallpapers"
4. Choose **Public**
5. **Do not** add a README, .gitignore, or license (the project already has these)
6. Click **Create repository**

## 2. Add the remote and push (from your terminal)

In the project folder, run (replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name):

```bash
cd "/Users/swaathykumaran/Documents/Zero to one 2/color-roulette"

# Add GitHub as remote (use the URL GitHub shows after creating the repo)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or with SSH (if you use SSH keys):
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

If your branch is named `master` instead of `main`:

```bash
git push -u origin master
```

## 3. If GitHub asks you to log in

- **HTTPS:** Use your GitHub username and a **Personal Access Token** (not your password).  
  Create one: GitHub → Settings → Developer settings → Personal access tokens.
- **SSH:** Ensure your SSH key is added to GitHub (Settings → SSH and GPG keys).

That’s it. After this, future updates: `git add .` → `git commit -m "message"` → `git push`.
