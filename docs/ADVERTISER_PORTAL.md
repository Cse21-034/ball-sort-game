# Advertiser Portal Documentation

## Overview

The advertiser portal allows businesses to submit video ads to run in Ball Sort Puzzle. This generates revenue while keeping the game free-to-play for users.

---

## For Advertisers (Business Users)

### Access the Portal

1. Go to **https://ball-sort-game-eight.vercel.app/advertise**
2. Fill out the ad submission form with your company details

### Submit an Ad

**Required Information:**
- Company Name
- Email Address
- Video URL (MP4 format, 30-60 seconds)
- Call-to-Action Button Text (e.g., "Learn More", "Shop Now")
- Monthly Budget ($100 minimum)

**Optional Information:**
- Phone Number
- Website URL
- Target Audience
- Additional message about your business

### Video Specifications

- **Format:** MP4 (H.264)
- **Duration:** 30-60 seconds
- **Resolution:** 1080p recommended (1920x1080 or 1024x576)
- **File Size:** Maximum 50MB
- **Frame Rate:** 24-30 FPS
- **Audio:** Optional (mono or stereo)

### Pricing Model

We use **CPM (Cost Per Mille)** pricing:

| Tier | CPM Rate | Monthly Budget |
|------|----------|-----------------|
| Basic | $0.50 | $100-$500 |
| Standard | $1.50 | $500-$2,000 |
| Premium | $3.00 | $2,000+ |

**Example:**
- CPM: $2.00
- Monthly Budget: $1,000
- Estimated Impressions: 500,000 (1,000,000 ÷ 1,000 × $2)

### After Submission

1. You'll receive a confirmation email
2. Our team reviews your ad within **2-3 business days**
3. We'll contact you with approval status
4. If approved, you'll receive:
   - Contract details
   - Ad tracking dashboard access
   - Launch date
5. Your ad goes live once payment is received

### Performance Metrics

Once your ad is approved, you'll have access to a dashboard showing:

- **Impressions** - Number of times your ad was shown
- **Clicks** - Number of user clicks on your CTA button
- **CTR (Click-Through Rate)** - Percentage of impressions that resulted in clicks
- **Engagement** - Time spent on your ad
- **Geographic Distribution** - Where your viewers are from
- **Device Breakdown** - Mobile, tablet, desktop breakdown

### Ad Requirements & Policies

**Your ads must NOT:**
- Contain misleading or deceptive content
- Promote illegal products or services
- Include adult content
- Be discriminatory or hateful
- Contain excessive flashing (seizure risk)
- Violate copyright or trademarks

**Prohibited Industries:**
- Illegal products/services
- Weapons or explosives
- Tobacco or e-cigarettes
- Alcohol (limited)
- Prescription medications
- Gambling/betting sites
- Multi-level marketing (MLM)

---

## For Game Admin

### Access Admin Dashboard

1. Go to **https://ball-sort-game-eight.vercel.app/admin/advertisers**
2. Authentication required (implement via your auth system)

### Review Submissions

The admin dashboard shows:

- Company name and contact info
- Video preview (click to view)
- Budget and target audience
- Status (Pending/Approved/Rejected)
- Time submitted
- Action buttons

### Manage Submissions

**Approve an Ad:**
1. Click the ✓ (checkmark) button
2. Confirm approval
3. Advertiser receives approval email
4. Email includes:
   - Contract link
   - Payment instructions
   - Go-live checklist

**Reject an Ad:**
1. Click the ✗ (X) button
2. Select rejection reason
3. Advertiser receives rejection email
4. Email explains why and allows resubmission

**View Details:**
1. Click the 👁 (eye) button
2. See full submission details and video preview
3. Add internal notes

### Database Schema

**advertiser_submissions Table:**

```sql
CREATE TABLE advertiser_submissions (
  id UUID PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  video_url VARCHAR(500) NOT NULL,
  call_to_action VARCHAR(100) NOT NULL,
  target_audience VARCHAR(50),
  monthly_budget DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP
);
```

### Setting Up Admin Authentication

Currently, the admin endpoint uses a placeholder `Bearer` token. To secure it:

**Option 1: Use Supabase Auth**
```typescript
// In your API route
const { data: { user } } = await supabase.auth.getUser(request)
if (!user || user.role !== 'admin') return Unauthorized
```

**Option 2: Use API Keys**
```typescript
// In your API route
const apiKey = request.headers.get('x-api-key')
if (apiKey !== process.env.ADMIN_API_KEY) return Unauthorized
```

---

## Revenue Flow

### How Revenue Works

1. **Advertiser submits ad** with $X/month budget
2. **Ad is approved** and goes live
3. **Ad generates impressions** as users see it in-game
4. **Payment collected** via Stripe/PayPal
5. **Payment split:**
   - 70% to your game revenue
   - 30% Stripe/PayPal fees and hosting

### Financial Forecasting

**Example Game with 1,000 DAU (Daily Active Users):**

- Monthly Impressions: 1,000 × 30 days × 5 ad shows/session = 150,000
- With $2 CPM: 150,000 ÷ 1,000 × $2 = **$300/month**

**With 5 approved advertisers at $1,000/month budget:**
- Total impressions available: 5 × 1,000 ÷ $2 CPM = 2,500,000
- Monthly revenue: **$5,000 (before fees)**

---

## Best Practices

### For Advertisers

✅ **DO:**
- Make compelling video content (first 3 seconds hook!)
- Use clear call-to-action buttons
- Test your video in-game before paying
- Track results and optimize based on CTR
- Respect audience preferences

❌ **DON'T:**
- Use misleading titles or thumbnails
- Autoplay audio (jarring for players)
- Use fake engagement metrics
- Click your own ads
- Violate platform policies

### For Game Admin

✅ **DO:**
- Review ads within 24 hours
- Provide constructive rejection feedback
- Maintain fair CPM rates
- Communicate clearly with advertisers
- Monitor ad quality regularly

❌ **DON'T:**
- Accept low-quality ads
- Be biased toward specific companies
- Ignore policy violations
- Hide fees or terms
- Promise unrealistic metrics

---

## Implementation Checklist

- [ ] Deploy `/advertise` page and make visible in-game
- [ ] Set up Supabase `advertiser_submissions` table
- [ ] Create `admin/advertisers` dashboard
- [ ] Implement email notifications (optional but recommended)
- [ ] Add payment processing (Stripe/PayPal)
- [ ] Create admin authentication
- [ ] Test submission flow end-to-end
- [ ] Create advertiser contract template
- [ ] Set up metrics dashboard for advertisers
- [ ] Document payment terms and conditions

---

## API Reference

### Submit Ad Proposal

**POST** `/api/advertiser-submissions`

```json
{
  "companyName": "Nike",
  "email": "ads@nike.com",
  "phone": "+1-555-0000",
  "website": "https://nike.com",
  "videoUrl": "https://example.com/nike-ad.mp4",
  "callToAction": "Shop Now",
  "targetAudience": "casual-gamers",
  "budget": "5000",
  "message": "We'd love to advertise our new gaming shoes!"
}
```

**Response:** `201 Created`
```json
{
  "message": "Ad proposal submitted successfully",
  "submissionId": "uuid-1234"
}
```

### Get Pending Submissions

**GET** `/api/advertiser-submissions`

**Headers:**
```
Authorization: Bearer {admin-token}
```

**Response:** `200 OK`
```json
{
  "submissions": [
    {
      "id": "uuid-1234",
      "company_name": "Nike",
      "email": "ads@nike.com",
      "monthly_budget": 5000,
      "status": "pending",
      "created_at": "2026-04-01T12:00:00Z"
    }
  ]
}
```

---

## Support

For advertiser questions:
- Email: `advertise@ballsortgame.com`
- Website: Visit `/advertise` for FAQ

For admin support:
- Internal task: Check `admin/advertisers` dashboard
- Database: Query `advertiser_submissions` table

---

**Last Updated: April 1, 2026**
