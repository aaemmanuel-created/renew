# RENEW — GitHub Pages Deployment Guide

## Prerequisites

- **Git** installed on your computer ([download](https://git-scm.com/downloads))
- **Node.js** (v18 or later) installed ([download](https://nodejs.org/))
- A **GitHub account** ([github.com](https://github.com))

To verify you have Git and Node installed, open your terminal and run:

```bash
git --version
node --version
npm --version
```

---

## Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Set the repository name to **renew**
3. Leave it as **Public** (required for free GitHub Pages)
4. Do **not** initialize with a README, .gitignore, or license
5. Click **Create repository**

> **Important:** The repository name must match the `base` value in `vite.config.js`. If you use a different repo name, open `vite.config.js` and change `base: '/renew/'` to `base: '/your-repo-name/'`.

---

## Step 2: Set Up the Project Locally

Open your terminal and navigate to the `renew-app` folder:

```bash
cd path/to/renew-app
```

Install dependencies:

```bash
npm install
```

---

## Step 3: Test Locally

Start the development server to make sure everything works:

```bash
npm run dev
```

This will open the app at `http://localhost:5173/renew/`. You should see the RENEW home screen. Press `Ctrl+C` to stop the server when you're done testing.

---

## Step 4: Push to GitHub

Initialize Git and push the code to your new repository:

```bash
git init
git add .
git commit -m "Initial commit — RENEW app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/renew.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 5: Deploy to GitHub Pages

Build and deploy with a single command:

```bash
npm run deploy
```

This does two things:
1. Builds the production app into the `dist/` folder
2. Pushes the `dist/` folder to a `gh-pages` branch on GitHub

**First time only:** After the deploy command finishes, go to your repo on GitHub:

1. Go to **Settings** → **Pages** (in the left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Set the branch to **gh-pages** and folder to **/ (root)**
4. Click **Save**

Wait 1–2 minutes, then visit:

```
https://YOUR_USERNAME.github.io/renew/
```

---

## Updating the App

Whenever you make changes to the code:

```bash
# 1. Build and deploy
npm run deploy

# 2. (Optional) Also commit your source changes
git add .
git commit -m "Describe your changes"
git push
```

The `npm run deploy` command always builds fresh and pushes to `gh-pages`. Your source code on `main` and the deployed site on `gh-pages` are independent — deploy whenever you're ready.

---

## Troubleshooting

**"Permission denied" on push:**
You may need to authenticate with GitHub. Run `gh auth login` if you have the GitHub CLI, or set up a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

**Blank page after deploy:**
Make sure the `base` in `vite.config.js` matches your repo name exactly (with leading and trailing slashes): `base: '/renew/'`.

**Microphone not working on the deployed site:**
GitHub Pages serves over HTTPS, which is required for microphone access. If you see a permission prompt, click "Allow". On iOS Safari, you may need to grant permission each time.

**Changes not showing up:**
GitHub Pages can take 1–2 minutes to update. Hard-refresh your browser with `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to bypass the cache.
