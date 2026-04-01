---
description: How to deploy Lemuria Heritage to Vercel
---
// turbo-all
# Lemuria Heritage Deployment Guide

To deploy your museum-grade storefront to `https://lemuriashop.vercel.app/`, follow these standardized steps:

### 1. Pre-Deployment Synchronization
Ensure your local master state is committed and cloud-ready:
```bash
git add .
git commit -m "Vercel Deployment: Optimized SSR & Turso Integration"
git push origin main
```

### 2. Install Vercel CLI (Optional but recommended)
If you wish to deploy from the command line:
```bash
npm install -g vercel
```

### 3. Configure Cloud Environment Variables
Log in to your [Vercel Dashboard](https://vercel.com/dashboard), navigate to **Project Settings > Environment Variables**, and add the following keys from your `.env.local`:

| Variable Key | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://lemuriashop-lemuriavawomain.aws-ap-south-1.turso.io` |
| `TURSO_AUTH_TOKEN` | `[Your Turso Token]` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_SUxx5TPi1gAaiJ` |
| `RAZORPAY_KEY_ID` | `rzp_live_SUxx5TPi1gAaiJ` |
| `RAZORPAY_KEY_SECRET` | `iMDtx6VMKK88ilDjgIBI7EGp` |
| `GITHUB_OWNER` | `[Your GitHub Username/Org]` |
| `GITHUB_REPO` | `[Your Repository Name]` |
| `GITHUB_TOKEN` | `[Your Personal Access Token]` |

### 4. Execute Deployment
Run the following command in your project root:
```bash
vercel deploy --prod
```
*Note: The first time you run this, you will need to log in and link your project.*

### 5. Authorize Production Domain (Firebase)
To enable Google Sign-In on your production site, you must authorize your domain in the Firebase Console:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (**lemuriashop-adaba**).
3. Navigate to **Build > Authentication > Settings**.
4. Scroll down to **Authorized domains**.
5. Click **Add domain** and enter `lemuriashop.vercel.app`.

### 6. Post-Deployment Verification
Once deployed and authorized, visit `https://lemuriashop.vercel.app/admin/maintenance` and click **"ESTABLISH CLOUD PERSISTENCE"** to sync your global artifact database.
