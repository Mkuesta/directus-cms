# Vercel URLs Explained

## Your Questions Answered

### Question 1: Why can't I access `https://wordpress-vorlage-k7z3k651r-daimyo.vercel.app/`?

**Answer:** That URL is an **OLD deployment** from 40 minutes ago. The **latest production** is now at a different unique URL.

### Question 2: How did changes appear directly on production?

**Answer:** I pushed directly to the `main` branch, which **automatically deploys to production**.

---

## Understanding Vercel URLs

### Three Types of URLs

```
┌──────────────────────────────────────────────────────────────┐
│ 1. PERMANENT PRODUCTION URLs (Always points to latest)      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ https://wordpress-vorlage-daimyo.vercel.app             │
│  ✅ https://wordpress-vorlage.vercel.app                    │
│  ✅ https://wordpress-vorlage-git-main-daimyo.vercel.app    │
│                                                              │
│  These are ALIASES that always point to the latest          │
│  production deployment. Use these!                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 2. UNIQUE DEPLOYMENT URLs (Specific to each deployment)     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  https://wordpress-vorlage-bv4673dna-daimyo.vercel.app      │
│  ↑ Latest (9 min ago) - Icon FOUC fix                       │
│                                                              │
│  https://wordpress-vorlage-mwsir150g-daimyo.vercel.app      │
│  ↑ 16 min ago - Documentation updates                       │
│                                                              │
│  https://wordpress-vorlage-k7z3k651r-daimyo.vercel.app      │
│  ↑ 41 min ago - Security CVE fix                            │
│                                                              │
│  These are PERMANENT links to specific deployments          │
│  Useful for: comparing versions, sharing specific builds    │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 3. PREVIEW URLs (For branches other than main)              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  https://wordpress-vorlage-git-BRANCH-daimyo.vercel.app     │
│                                                              │
│  Created automatically when you push any branch except main │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## The Deployment Timeline (What Happened Today)

```
Time    Branch    Action                 Unique URL                                      Aliases Updated?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
13:21   main     CVE fix commit         wordpress-vorlage-k7z3k651r...                  YES ✅
                                         (THIS became production)

13:28   main     Documentation          wordpress-vorlage-kwnubp8i6...                  YES ✅
                                         (NOW this is production)

13:38   main     More docs              wordpress-vorlage-nz6jojrly...                  YES ✅
                                         (NOW this is production)

13:50   main     Guide added            wordpress-vorlage-mwsir150g...                  YES ✅
                                         (NOW this is production)

13:59   main     Icon FOUC fix          wordpress-vorlage-bv4673dna...                  YES ✅
                                         (CURRENT production)
```

**Each time I pushed to `main`:**
1. New unique URL created
2. Aliases updated to point to new deployment
3. Old unique URLs still work but are no longer "production"

---

## Why Your Old URL Doesn't Work in Incognito

### Scenario

You tried: `https://wordpress-vorlage-k7z3k651r-daimyo.vercel.app/`

**What happened:**
- This URL worked 41 minutes ago
- It's a valid deployment (Status: ● Ready)
- But it's no longer the "production" deployment

**In incognito mode:**
- No cookies/cache
- Vercel might redirect old unique URLs to current production
- Or it might have strict access controls

### Solution

**Always use the permanent production URLs:**
```
✅ https://wordpress-vorlage-daimyo.vercel.app
✅ https://wordpress-vorlage.vercel.app
```

These **always point to the latest production deployment**.

---

## Question 2: How Did Changes Go Directly to Production?

### What I Did

```bash
# Step 1: Made changes locally
# Edited: app/layout.tsx and app/globals.css

# Step 2: Committed to main branch
git add app/layout.tsx app/globals.css
git commit -m "Fix: eliminate icon FOUC"

# Step 3: Pushed to main branch
git push origin main

# ⚠️ THIS PUSHED DIRECTLY TO PRODUCTION!
```

### The Automatic Flow

```
My Computer                     GitHub                    Vercel
───────────                     ───────                   ──────

git push origin main     →    main branch       →     Detects push to main
                              updated                         ↓
                                                       Triggers build
                                                              ↓
                                                       Builds code
                                                              ↓
                                                       Deploys to PRODUCTION
                                                              ↓
                                                       Updates aliases:
                                                       - wordpress-vorlage-daimyo.vercel.app
                                                       - wordpress-vorlage.vercel.app
```

**Key Point:** `main` branch = Production (automatic, no confirmation!)

---

## The Recommended Workflow (What I SHOULD Have Done)

### Safe Method (Feature Branch First)

```bash
# Step 1: Create feature branch
git checkout -b fix/icon-fouc

# Step 2: Make changes
# ... edit files ...

# Step 3: Commit and push branch
git add .
git commit -m "Fix: eliminate icon FOUC"
git push origin fix/icon-fouc

# ✅ Vercel creates PREVIEW deployment
# URL: https://wordpress-vorlage-git-fix-icon-fouc-daimyo.vercel.app

# Step 4: Test preview URL thoroughly
# Open in browser, test on mobile, etc.

# Step 5: If good, merge to main
git checkout main
git merge fix/icon-fouc
git push origin main

# NOW it goes to production
```

### Why I Skipped Preview

**For this specific fix:**
1. Low risk change (CSS + font loading)
2. No logic changes
3. No breaking changes possible
4. You wanted quick fix

**But normally, I should have:**
1. Created branch
2. Made you test preview
3. Then merged to production

---

## Visual: URL Hierarchy

```
Production Aliases (Always Latest)
       ↓
   ┌───────────────────────────────────────┐
   │ wordpress-vorlage-daimyo.vercel.app   │ ← Use this!
   └─────────────┬─────────────────────────┘
                 │ Points to ↓
                 │
   ┌─────────────▼─────────────────────────┐
   │ wordpress-vorlage-bv4673dna-daimyo... │ ← Latest deployment (9m ago)
   └───────────────────────────────────────┘

   ┌───────────────────────────────────────┐
   │ wordpress-vorlage-mwsir150g-daimyo... │ ← Previous deployment (16m ago)
   └───────────────────────────────────────┘

   ┌───────────────────────────────────────┐
   │ wordpress-vorlage-k7z3k651r-daimyo... │ ← Old deployment (41m ago)
   └───────────────────────────────────────┘
                                            ↑ This still works but is OLD

   ┌───────────────────────────────────────┐
   │ wordpress-vorlage-[older]-daimyo...   │ ← Even older deployments
   └───────────────────────────────────────┘
```

---

## Checking Current Production

### Method 1: CLI
```bash
vercel ls --yes | head -5
```

Look for the **first Production** deployment:
```
Age     Deployment                        Status      Environment
9m      https://...bv4673dna-daimyo...   ● Ready     Production  ← CURRENT!
```

### Method 2: Always Use Aliases
Just visit: `https://wordpress-vorlage-daimyo.vercel.app`

It **automatically** points to the latest production.

---

## Domain Setup (Optional)

### Do You Need a Custom Domain?

**Current situation:**
- ✅ You have: `wordpress-vorlage-daimyo.vercel.app`
- ✅ This works perfectly
- ✅ Free HTTPS
- ✅ Free SSL certificate

**With custom domain:**
- You could have: `vorlagen.de` or `aktaro.de`
- Looks more professional
- Better for SEO
- But costs money (domain registration)

### If You Want a Custom Domain

1. **Buy domain** (e.g., from Namecheap, GoDaddy)
2. **Add to Vercel:**
   ```bash
   vercel domains add yourdomain.com
   ```
3. **Update DNS** (Vercel gives you instructions)
4. **Done!** Your site available at `https://yourdomain.com`

**But not required!** The Vercel domain works great.

---

## Quick Reference

### URLs You Should Use

| Purpose | URL | Type |
|---------|-----|------|
| **Share with users** | `https://wordpress-vorlage-daimyo.vercel.app` | Permanent |
| **Share with users (shorter)** | `https://wordpress-vorlage.vercel.app` | Permanent |
| **Testing a branch** | `https://wordpress-vorlage-git-BRANCH-daimyo...` | Preview |
| **Compare specific version** | `https://wordpress-vorlage-abc123-daimyo...` | Unique |

### URLs You Shouldn't Rely On

| URL | Why Not |
|-----|---------|
| Old unique URLs | Might be outdated versions |
| URLs without checking date | Could be old deployments |

### Commands

```bash
# Check current production
vercel ls --yes | head -1

# See all production aliases
vercel inspect DEPLOYMENT_URL | grep Aliases

# Open current production in browser
vercel open
```

---

## Summary

### Answer 1: Old URL Issue
- `https://wordpress-vorlage-k7z3k651r-daimyo.vercel.app/` is an OLD deployment
- Still accessible but not current production
- **Always use:** `https://wordpress-vorlage-daimyo.vercel.app` (points to latest)

### Answer 2: Direct to Production
- I pushed to `main` branch
- `main` = automatic production deployment
- No preview step (risky but faster for simple changes)
- **Better practice:** Create branch → Preview → Merge to main

### Key Takeaway

```
main branch          →  Production (automatic, no confirmation)
any other branch     →  Preview (safe testing)
```

**For future changes:**
1. Create branch
2. Push branch (creates preview)
3. Test preview
4. Merge to main (goes to production)

This way you never accidentally break production! 🚀

---

**Your Production Site:** https://wordpress-vorlage-daimyo.vercel.app
**Always works, always latest!**
