# Google AdSense Setup Guide

Google AdSense lets you earn money by displaying ads in your Ball Sort Puzzle game. This guide shows you exactly how to set it up.

---

## Step 1: Create a Google AdSense Account

1. Go to **[google.com/adsense](https://google.com/adsense)**
2. Click **"Sign In"** (use a Google account)
3. If you don't have a Google account, create one first
4. Click **"Get Started"** to create a new AdSense account
5. Follow the setup wizard:
   - Enter your website URL (where your game will be hosted)
   - Choose your ads categories
   - Accept the terms and conditions
   - Submit your application

**⏱️ Approval Time:** Google typically reviews applications within 24-48 hours.

---

## Step 2: Get Your AdSense Publisher ID

Once your application is approved:

1. Log in to **[AdSense Dashboard](https://www.google.com/adsense/new/u/0/pubcenter)**
2. Go to **Settings** → **Account** on the left sidebar
3. Look for **"Publisher ID"** (starts with `ca-pub-`)
   - Example: `ca-pub-1234567890123456`
4. Copy this ID, you'll need it in Step 4

---

## Step 3: Create Ad Slots (Ad Units)

Your game displays ads in two places:

### Banner Ad (appears in main menu)

1. In AdSense, go to **Ads & Sites** → **Ad Units** on the left sidebar
2. Click **"CreateBallSort-Banner New Ad Unit"**
   - **Name:** `` (or any name you like)
   - **Ad Unit Type:** Display Ads
   - **Ad Size:** Auto (responsive)
   - Click **"Create Ad Unit"**
3. Copy the **AD UNIT ID** (10-digit number, e.g., `1234567890`)
   - This is your `NEXT_PUBLIC_ADSENSE_SLOT_BANNER`

### Interstitial Ad (shows between gameplay)

1. Click **"Create New Ad Unit"** again
   - **Name:** `BallSort-Interstitial`
   - **Ad Unit Type:** Display Ads
   - **Ad Size:** Interstitial (Full Page)
   - Click **"Create Ad Unit"**
2. Copy the **AD UNIT ID**
   - This is your `NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL`

---

## Step 4: Add to `.env.local`

Now add your credentials to the project:

1. In VS Code, open or create `.env.local` in the project root
2. Add these lines (replace with YOUR values):

```bash
# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_PUBLISHER_ID_HERE
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=YOUR_BANNER_SLOT_ID_HERE
NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL=YOUR_INTERSTITIAL_SLOT_ID_HERE
```

**Example (with your actual values):**
```bash
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-5482317329371849
NEXT_PUBLIC_ADSENSE_SLOT_BANNER=8078142083
NEXT_PUBLIC_ADSENSE_SLOT_INTERSTITIAL=3910397445
```

---

## Step 5: Restart Your Dev Server

**Stop and restart your development server:**

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
# or
pnpm dev
```

---

## Step 6: Test the Ads

### In Development (Sandbox Mode)

Your game will show **placeholder ads** until you go live:

1. **Banner Ad** (Main Menu)
   - Shows gray box saying "📢 Google AdSense Banner Placeholder"
   - This will display real ads once approved

2. **Interstitial Ad** (Between Levels)
   - Shows gray box during gameplay
   - Will display full-screen ads when approved

### Testing Checklist

- [ ] Dev server is running
- [ ] `.env.local` has your Publisher ID added
- [ ] You can see placeholder ads in the game
- [ ] No console errors about "NEXT_PUBLIC_ADSENSE_CLIENT"
- [ ] No "Ad blocker" warnings

### Check Console for Errors

1. Open **DevTools** (F12 or Ctrl+Shift+I)
2. Go to **Console** tab
3. Look for warnings like:
   - `"[GoogleAdBanner] NEXT_PUBLIC_ADSENSE_CLIENT not configured"` = env var missing
   - `"[GoogleAdBanner] Google AdSense script not loaded"` = script loading issue

---

## Step 7: Deploy to Production

Once your ads are working locally:

1. **Deploy to Vercel** (or your hosting platform)
2. Add same `.env.local` variables to your hosting platform's env vars:
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment
   - Other platforms: Follow their documentation

Your real ads will show once you're live!

---

## Implementation Details

### Where Ads Are Used

**Banner Ad** (Main Menu & Game Screens)
- File: [`components/ads/GoogleAdBanner.tsx`](../components/ads/GoogleAdBanner.tsx)
- Used in: Main menu, leaderboard, settings screens
- Size: Responsive (auto)

**Interstitial Ad** (Between Levels)
- File: [`components/ads/GoogleAdInterstitial.tsx`](../components/ads/GoogleAdInterstitial.tsx)
- Shows: After completing a level
- Size: Full-screen (interstitial)

**Script Loading**
- File: [`app/layout.tsx`](../app/layout.tsx)
- Loads: Google AdSense SDK when env var is set
- Safe: Only loads if `NEXT_PUBLIC_ADSENSE_CLIENT` exists

### Component Usage

If you want to add ads to a new page:

```tsx
import { GoogleAdBanner } from "@/components/ads/GoogleAdBanner"

export function MyComponent() {
  return (
    <div>
      <h1>My Game Page</h1>
      
      {/* Add banner ad */}
      <GoogleAdBanner 
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER!}
        format="auto"
        className="my-4"
      />
    </div>
  )
}
```

---

## Troubleshooting

### No Ads Showing, Just Placeholder

**Problem:** You see gray boxes instead of real ads

**Solutions:**
1. Check your AdSense application is approved (check email)
2. Verify env vars in `.env.local` are spelled correctly (case-sensitive)
3. Make sure numbers don't have spaces or quotes
4. Restart dev server after adding env vars
5. Clear browser cache (Ctrl+Shift+Delete)
6. Check console for errors (DevTools → Console)

### "NEXT_PUBLIC_ADSENSE_CLIENT not configured"

**Problem:** Console shows this warning

**Solutions:**
1. Open `.env.local` file
2. Add this line: `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_ID_HERE`
3. Replace `YOUR_ID_HERE` with your actual Publisher ID
4. Save the file
5. Restart dev server

### "Ads are blocked by ad blocker extension"

**Problem:** Your browser extension is blocking ads

**Solutions:**
1. Disable ad blockers (uBlock, Adblock Plus, etc.)
2. Or whitelist your dev URL
3. Test in incognito/private browsing mode

### AdSense Shows Ads but Says "Limited or No Ads"

**Problem:** Only see "limited" ads instead of full ads

**Solutions:**
- This is normal in first 24-48 hours
- Your site may need more traffic for ad variety
- Check your AdSense account for warnings or violations
- Ensure your content follows AdSense policies

---

## Payment & Earnings

### How Much Can You Earn?

- **CPM (Cost Per Mille):** $0.50 - $5 per 1,000 ad impressions
- **CPC (Cost Per Click):** $0.10 - $5 per ad click
- **RPM (Revenue Per Mille):** Your earnings per 1,000 impressions

*Example: 10,000 impressions with $2 CPM = $20 earnings*

### Payment Threshold

- Earnings must reach **$100** before you can cash out
- Google pays on the 21st of each month (if threshold met)
- Payment goes to your Google AdSense account

---

## Best Practices

✅ **DO:**
- Display ads prominently so users see them
- Keep your game fun and engaging (more plays = more ad impressions)
- Promote your game to get more traffic
- Monitor AdSense Dashboard for performance
- Add both banner and interstitial ads

❌ **DON'T:**
- Click your own ads (Google will ban you)
- Ask users to click ads
- Hide or disguise ads
- Place ads where they interfere with gameplay too much
- Disable ads for certain users

---

## Still Need Help?

- **Google AdSense Help:** [support.google.com/adsense](https://support.google.com/adsense)
- **AdSense Community:** [groups.google.com/g/google-adsense](https://groups.google.com/g/google-adsense)
- **Publisher ID Not Found:** Check Settings → Account in AdSense
- **Ad Unit ID Not Found:** Check Ads & Sites → Ad Units in AdSense

---

## Quick Reference

| Item | Where to Find | File |
|------|---------------|------|
| Publisher ID | AdSense Dashboard → Settings → Account | `.env.local` |
| Banner Slot | AdSense Dashboard → Ad Units (Display Ads) | `.env.local` |
| Interstitial Slot | AdSense Dashboard → Ad Units (Interstitial) | `.env.local` |
| Banner Component | — | `components/ads/GoogleAdBanner.tsx` |
| Interstitial Component | — | `components/ads/GoogleAdInterstitial.tsx` |
| Script Loading | — | `app/layout.tsx` |
