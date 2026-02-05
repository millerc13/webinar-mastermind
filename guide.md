# Go High Level Setup Guide - Todd's Wealth Masterclass (Feb 2026)

## Overview
This guide walks you through setting up all automations for Todd's free webinar with VIP upgrade ($27).

**Event:** Wealth Masterclass - February 2026
**Webinar Dates:**
- Sunday, February 16th @ 7PM ET
- Wednesday, February 18th @ 7PM ET

---

## 1. CUSTOM FIELDS

Go to: **Settings → Custom Fields → Contact**

Create these fields:

| Field Name | Field Type | Options/Notes |
|------------|-----------|---------------|
| `Masterclass 0226 - Date` | Dropdown | `Feb 16, 2026` / `Feb 18, 2026` |
| `Masterclass 0226 - VIP Status` | Dropdown | `Free` / `VIP` |
| `Masterclass 0226 - Improvement Goal` | Multi-line Text | Response to "What do you want to improve?" |

> **Note:** We prefix with "Masterclass 0226" so these fields don't get confused with other events.

### ✅ Custom Fields Created

| Field Name | Type | Merge Field (Unique Key) |
|------------|------|--------------------------|
| Masterclass 0226 - Date | SINGLE_OPTIONS | `{{ contact.masterclass_0226__date }}` |
| Masterclass 0226 - VIP Status | MULTIPLE_OPTIONS | `{{ contact.masterclass_0226__vip_status }}` |
| Masterclass 0226 - Improvement Goal | LARGE_TEXT | `{{ contact.masterclass_0226__improvement_goal }}` |

> **Use these merge fields in your emails/SMS to personalize messages.**

---

## 2. TAGS

Go to: **Settings → Tags**

Create these tags:

**Registration Tags:**
- `Masterclass 0226 - Registered`
- `Masterclass 0226 - Feb 16`
- `Masterclass 0226 - Feb 18`

**VIP Tags (date-specific so you know which session they're VIP for):**
- `Masterclass 0226 - VIP - Feb 16`
- `Masterclass 0226 - VIP - Feb 18`

**Status Tags:**
- `Masterclass 0226 - Free Confirmed`
- `Masterclass 0226 - Attended`
- `Masterclass 0226 - No Show`

**Setter Tags (can be reused across events):**
- `Setter - Needs Outreach`
- `Setter - Contacted`

> **Tag Naming Convention:**
> - Event identifier: `Masterclass 0226`
> - VIP tags include the date: `VIP - Feb 16` so you can filter VIPs by session
> - This prevents confusion with other events that also have VIP offerings

---

## 3. PIPELINE

Go to: **Opportunities → Pipelines → Create Pipeline**

**Pipeline Name:** `Masterclass 0226 - Registration`

### ✅ Pipeline Created

| Stage | Color Suggestion |
|-------|------------------|
| New Registration | Blue |
| Abandon Cart | Red |
| Free Confirmed | Gray |
| VIP Purchased | Green |
| Reminded | Yellow |
| Attended | Green |
| No Show | Red |

> **Note:** Use the custom field `Masterclass 0226 - Date` to filter by Feb 16 vs Feb 18 within the pipeline.

---

## 4. PRODUCTS

Go to: **Payments → Products → Add Product**

**Product: VIP Upgrade**
- Name: `Masterclass 0226 - VIP Upgrade`
- Price: `$27.00`
- Description:
  ```
  Includes:
  - Todd's "Real Estate for Dummies" eBook
  - Recorded replay access
  - 30-minute private Q&A session with Todd
  ```

---

## 5. WORKFLOWS

Go to: **Automation → Workflows → Create Workflow**

**Folder:** `04. Mastermind Webinar`

> Create all workflows in this folder to keep them organized.

---

### WORKFLOW 1: New Registration

**Name:** `Masterclass 0226 - New Registration`

**Trigger:** Tag Added → `Masterclass 0226 - Registered`

> The Vercel API creates the contact and adds this tag via GHL API. When the tag is added, this workflow fires.

**Actions (Step-by-Step in GHL):**

> **Important:** In GHL, you can only add actions INSIDE condition branches, not after them. So we put the common actions first, then the condition last.

---

**Action 1: Add to Pipeline**

1. Click **+ Add Action** → Select **Add to Workflow Pipeline**
2. Pipeline: `Masterclass 0226 - Registration`
3. Stage: `New Registration`

---

**Action 2: Add Tag (Setter Outreach)**

1. Click **+ Add Action** → **Add Tag**
2. Tag: `Setter - Needs Outreach`

---

**Action 3: Send Email (Confirmation)**

1. Click **+ Add Action** → **Send Email**
2. Subject: `You're in! Here's your Zoom link for Todd's Masterclass`
3. Body should include:
   - Welcome message
   - Zoom link (you'll add this manually)
   - Date/time: Use merge field `{{ contact.masterclass_0226__date }}` @ 7PM ET
   - Add to Calendar link

---

**Action 4: Wait**

1. Click **+ Add Action** → **Wait**
2. Wait for: `2 minutes`

---

**Action 5: Send SMS (Qualifying Question)**

1. Click **+ Add Action** → **Send SMS**
2. Message:
```
Hey {{contact.first_name}}! You're confirmed for Todd's FREE masterclass.
Quick question - what's the #1 thing you want to improve in your financial life?
Reply and let me know!
```

---

**Action 6: Internal Notification**

1. Click **+ Add Action** → **Internal Notification** (or Send Email to your team)
2. Send to: Your team email or phone
3. Message:
```
🔥 NEW WEBINAR REGISTRATION
Name: {{contact.first_name}} {{contact.last_name}}
Phone: {{contact.phone}}
Email: {{contact.email}}
Date: {{ contact.masterclass_0226__date }}

TEXT THEM NOW!
```

---

**Action 7: Condition (Add Date-Specific Tag)**

This adds the tag that triggers the reminder workflow for their specific date.

1. Click **+ Add Action** → **Condition**
2. **Action Name:** `Add Date Tag`
3. **Scenario Recipe:** Select `Build Your Own`

**Branch 1 - Feb 16, 2026:**
- Click on the **Branch** box, rename to: `Feb 16, 2026`
- **Select:** `Contact Field`
- **Field:** `Masterclass 0226 - Date`
- **Operator:** `Is`
- **Value:** `Feb 16, 2026`
- **Inside this branch:** Add action → **Add Tag** → `Masterclass 0226 - Feb 16`
- **Then add:** Wait → `15 minutes`
- **Then add:** Another Condition (see Action 8 below - you'll duplicate it here)

**Branch 2 - Feb 18, 2026:**
- Click **+ Add Branch**, rename to: `Feb 18, 2026`
- **Select:** `Contact Field`
- **Field:** `Masterclass 0226 - Date`
- **Operator:** `Is`
- **Value:** `Feb 18, 2026`
- **Inside this branch:** Add action → **Add Tag** → `Masterclass 0226 - Feb 18`
- **Then add:** Wait → `15 minutes`
- **Then add:** Another Condition (see Action 8 below - you'll duplicate it here)

**None Branch:**
- **Inside this branch:** Wait → `15 minutes`
- **Then add:** Another Condition (see Action 8 below)

---

**Action 8: Condition (Abandon Cart Check) - Add inside EACH branch above**

Inside each of the 3 branches from Action 7, add this condition:

1. Click **+ Add Action** → **Condition**
2. **Action Name:** `Check if Purchased or Confirmed`
3. **Scenario Recipe:** `Build Your Own`

**Branch 1 - VIP Purchased:**
- Rename to: `VIP Purchased`
- **Select:** `Contact Tag`
- **Operator:** `Contains`
- **Value:** `Masterclass 0226 - VIP`
- **Inside this branch:** Leave empty (workflow ends, they're VIP)

**Branch 2 - Free Confirmed:**
- Click **+ Add Branch**, rename to: `Free Confirmed`
- **Select:** `Contact Tag`
- **Operator:** `Is`
- **Value:** `Masterclass 0226 - Free Confirmed`
- **Inside this branch:** Leave empty (workflow ends, they confirmed free)

**None Branch - Abandon Cart:**
- This catches anyone who didn't take action
- **Inside this branch:**
  1. Add action → **Update Opportunity Stage**
     - Pipeline: `Masterclass 0226 - Registration`
     - Stage: `Abandon Cart`
  2. Add action → **Add to Workflow**
     - Select: `Masterclass 0226 - Abandon Cart Recovery`

---

### Visual Flow Summary

```
Start (Tag Added: Masterclass 0226 - Registered)
  │
  ├── Add to Pipeline → New Registration
  ├── Add Tag → Setter - Needs Outreach
  ├── Send Email → Confirmation
  ├── Wait 2 min
  ├── Send SMS → Qualifying Question
  ├── Internal Notification
  │
  └── Condition: Check Date
        │
        ├── Feb 16, 2026 Branch:
        │     ├── Add Tag → Masterclass 0226 - Feb 16
        │     ├── Wait 15 min
        │     └── Condition: Check VIP/Free
        │           ├── VIP Purchased → End
        │           ├── Free Confirmed → End
        │           └── None → Move to Abandon Cart + Start Recovery Workflow
        │
        ├── Feb 18, 2026 Branch:
        │     ├── Add Tag → Masterclass 0226 - Feb 18
        │     ├── Wait 15 min
        │     └── Condition: Check VIP/Free
        │           ├── VIP Purchased → End
        │           ├── Free Confirmed → End
        │           └── None → Move to Abandon Cart + Start Recovery Workflow
        │
        └── None Branch:
              ├── Wait 15 min
              └── Condition: Check VIP/Free
                    ├── VIP Purchased → End
                    ├── Free Confirmed → End
                    └── None → Move to Abandon Cart + Start Recovery Workflow
```

> **Note:** Yes, you have to duplicate the "Check VIP/Free" condition in each branch. This is how GHL works - actions after conditions must go inside branches.

---

### WORKFLOW 2: VIP Purchase

**Name:** `Masterclass 0226 - VIP Purchase`

**Trigger:** Payment Received (Product = "Masterclass 0226 - VIP Upgrade")

**Actions:**

```
1. IF/ELSE (Add date-specific VIP tag)
   ├── IF Tag = "Masterclass 0226 - Feb 16"
   │   └── Add Tag: "Masterclass 0226 - VIP - Feb 16"
   └── IF Tag = "Masterclass 0226 - Feb 18"
       └── Add Tag: "Masterclass 0226 - VIP - Feb 18"

2. Update Custom Field: Masterclass 0226 - VIP Status = "VIP"

3. Move Pipeline Stage: "VIP Purchased"

4. Send Email: "Welcome VIP! Here's Your eBook"
   Subject: "🎉 You're a VIP! Here's your eBook + what's next"
   Body:
   - Thank you message
   - "Real Estate for Dummies" eBook download link
   - Reminder: Replay will be sent after the live event
   - Reminder: Private Q&A details coming soon

5. Internal Notification:
   "💰 VIP PURCHASE!
   {{contact.first_name}} {{contact.last_name}} upgraded to VIP!
   Email: {{contact.email}}
   Date: {{ contact.masterclass_0226__date }}"
```

---

### WORKFLOW 3: Free Registration Confirmed

**Name:** `Masterclass 0226 - Free Confirmed`

**Trigger:** Tag Added = "Masterclass 0226 - Free Confirmed"

**Actions:**

```
1. Move Pipeline Stage: "Free Confirmed"

2. Update Custom Field: Masterclass 0226 - VIP Status = "Free"
```

---

### WORKFLOW 4: Abandon Cart Recovery

**Name:** `Masterclass 0226 - Abandon Cart Recovery`

**Trigger:** Pipeline Stage Changed to "Abandon Cart" (in Masterclass 0226 - Registration pipeline)

**Actions:**

```
1. Wait: 5 minutes

2. Send SMS:
   "Hey {{contact.first_name}}, I noticed you didn't finish grabbing your VIP spot.
   Todd's Real Estate eBook + replay + private Q&A is only $27.
   Want me to send you the link?"

3. Wait: 1 hour

4. Send Email: "Did you forget something?"
   Subject: "You left something behind..."
   Body:
   - Reminder about VIP benefits
   - Link back to upgrade page
   - Urgency: Limited VIP spots

5. Wait: 24 hours

6. IF Tag does NOT contain "Masterclass 0226 - VIP":
   └── Send SMS:
       "Last chance {{contact.first_name}} - VIP spots are almost gone.
       $27 gets you Todd's Real Estate eBook, replay, and private Q&A.
       [UPGRADE LINK]"
```

---

### WORKFLOW 5: Reminder Sequence - Feb 16

**Name:** `Masterclass 0226 - Reminders Feb 16`

**Trigger:** Tag Added = "Masterclass 0226 - Feb 16"

**Actions:**

```
1. Wait until: February 13, 2026 @ 7:00 PM ET (72 hours before)

2. Send Email: "72-Hour Reminder"
   Subject: "Todd's masterclass is in 3 days!"

3. Send SMS:
   "Hey {{contact.first_name}}, just a reminder - Todd's FREE masterclass
   is in 3 days! Sunday Feb 16th @ 7PM ET. See you there!"

4. Wait until: February 15, 2026 @ 7:00 PM ET (24 hours before)

5. Send Email: "24-Hour Reminder"
   Subject: "TOMORROW: Todd's Live Masterclass"

6. Send SMS:
   "{{contact.first_name}} - Tomorrow's the day! Todd goes live at 7PM ET.
   This is where everything changes. Don't miss it."

7. Move Pipeline Stage: "Reminded"

8. Wait until: February 16, 2026 @ 6:00 PM ET (1 hour before)

9. Send Email: "1-Hour Reminder"
   Subject: "⏰ STARTING IN 1 HOUR!"

10. Send SMS:
    "{{contact.first_name}} we're going LIVE in 1 hour!
    Grab your spot now: [ZOOM LINK]"
```

---

### WORKFLOW 6: Reminder Sequence - Feb 18

**Name:** `Masterclass 0226 - Reminders Feb 18`

**Trigger:** Tag Added = "Masterclass 0226 - Feb 18"

**Duplicate Workflow 5 and change dates:**
- 72 hours: February 15, 2026 @ 7:00 PM ET
- 24 hours: February 17, 2026 @ 7:00 PM ET
- 1 hour: February 18, 2026 @ 6:00 PM ET

---

### WORKFLOW 7: Post-Webinar - Attended

**Name:** `Masterclass 0226 - Post Attended`

**Trigger:** Tag Added = "Masterclass 0226 - Attended"

**Actions:**

```
1. Move Pipeline Stage: "Attended"

2. IF/ELSE:
   ├── IF Tag contains "Masterclass 0226 - VIP":
   │   └── Send Email: "Here's Your Replay!"
   │       Subject: "Your replay is ready + Private Q&A details"
   │       Body:
   │       - Replay link
   │       - Private Q&A date/time
   │       - eBook reminder (Real Estate for Dummies)
   │
   └── ELSE (Free registrant):
       └── Send Email: "Thanks for attending!"
           Subject: "Thanks for joining Todd live!"
           Body:
           - Thank you message
           - Offer: "Want the replay? Upgrade to VIP for just $27"
           - Link to upgrade page
```

---

### WORKFLOW 8: Post-Webinar - No Show

**Name:** `Masterclass 0226 - No Show`

**Trigger:** Tag Added = "Masterclass 0226 - No Show"

**Actions:**

```
1. Move Pipeline Stage: "No Show"

2. Wait: 1 hour

3. Send Email: "We missed you!"
   Subject: "We missed you at the masterclass..."
   Body:
   - "Life happens" message
   - Offer replay access via VIP upgrade
   - Link to upgrade

4. Send SMS:
   "Hey {{contact.first_name}}, we missed you at Todd's masterclass!
   Want access to the replay? Reply YES and I'll send you the link."

5. Add Tag: "Setter - Needs Outreach"
```

---

## 6. SMART LISTS

Go to: **Contacts → Smart Lists → Create**

| List Name | Filter |
|-----------|--------|
| Masterclass 0226 - Feb 16 All | Tag = "Masterclass 0226 - Feb 16" |
| Masterclass 0226 - Feb 16 VIPs | Tag = "Masterclass 0226 - VIP - Feb 16" |
| Masterclass 0226 - Feb 18 All | Tag = "Masterclass 0226 - Feb 18" |
| Masterclass 0226 - Feb 18 VIPs | Tag = "Masterclass 0226 - VIP - Feb 18" |
| Masterclass 0226 - All VIPs | Tag contains "Masterclass 0226 - VIP" |
| Masterclass 0226 - Abandon Cart | Pipeline Stage = "Abandon Cart" AND Pipeline = "Masterclass 0226 - Registration" |
| Masterclass 0226 - No Shows | Tag = "Masterclass 0226 - No Show" |
| Setter Outreach Needed | Tag = "Setter - Needs Outreach" |

---

## 7. ZOOM SETUP

1. Go to: **Settings → Integrations → Zoom**
2. Connect your Zoom account
3. Create Zoom Webinars for:
   - February 16, 2026 @ 7:00 PM ET
   - February 18, 2026 @ 7:00 PM ET

**Pro Tip from Raf:** 10-15 minutes before going live, rename the Zoom event to "STARTING NOW - Join Todd Live!" to trigger notifications to all registered attendees.

---

## 8. CONNECTING YOUR CUSTOM LANDING PAGE

Your Vercel API creates the contact in GHL and adds the registration tag. When the tag is added, Workflow 1 triggers automatically.

### Step 1: Get Your GHL API Key

1. Go to **Settings → Business Profile → API Keys**
2. Create a new API key or copy existing one
3. Save it as an environment variable in Vercel: `GHL_API_KEY`

### Step 2: Get Your GHL Location ID

1. Go to **Settings → Business Profile**
2. Copy your Location ID
3. Save it as an environment variable in Vercel: `GHL_LOCATION_ID`

### Step 3: Update Your Vercel API (`/api/register`)

```javascript
// In your /api/register endpoint:

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

// Step 1: Create or update contact
const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28'
  },
  body: JSON.stringify({
    locationId: GHL_LOCATION_ID,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    customFields: [
      {
        key: 'masterclass_0226__date',
        field_value: data.webinarDate  // "Feb 16, 2026" or "Feb 18, 2026"
      }
    ],
    tags: ['Masterclass 0226 - Registered']  // This triggers Workflow 1
  })
});

const contact = await contactResponse.json();
console.log('Contact created:', contact.contact.id);
```

### How It Works

1. User submits registration form on your landing page
2. Vercel API creates contact in GHL with the `Masterclass 0226 - Registered` tag
3. GHL detects the tag was added → triggers **Workflow 1: New Registration**
4. Workflow sends confirmation email, SMS, adds to pipeline, etc.

### Alternative: Using GHL REST API v1 (Simpler)

```javascript
const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    tags: ['Masterclass 0226 - Registered'],
    customField: {
      masterclass_0226__date: data.webinarDate
    }
  })
});
```

---

## 9. UPGRADE PAGE INTEGRATION

Your upgrade page needs to trigger tags:

**When VIP is purchased:**
- GHL handles this automatically via payment trigger

**When "No thanks" is clicked:**
- Add this to your upgrade page button:

```javascript
// When "No thanks, continue free" is clicked
async function handleFreeConfirm() {
  await fetch('YOUR_GHL_WEBHOOK_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: userEmail, // from URL params
      tags: ['Masterclass 0226 - Free Confirmed']
    })
  });

  // Redirect to confirmation page
  window.location.href = '/confirmation.html';
}
```

---

## 10. EMAIL TEMPLATES TO CREATE

Create these in **Marketing → Emails → Templates**:

| Template Name | Used In |
|---------------|---------|
| Masterclass 0226 - Confirmation | Workflow 1 |
| Masterclass 0226 - VIP Welcome (eBook) | Workflow 2 |
| Masterclass 0226 - Abandon Cart | Workflow 4 |
| Masterclass 0226 - 72hr Reminder | Workflow 5/6 |
| Masterclass 0226 - 24hr Reminder | Workflow 5/6 |
| Masterclass 0226 - 1hr Reminder | Workflow 5/6 |
| Masterclass 0226 - Attended (VIP) | Workflow 7 |
| Masterclass 0226 - Attended (Free) | Workflow 7 |
| Masterclass 0226 - No Show | Workflow 8 |

---

## 11. SMS TEMPLATES

For quick reference, here are all SMS messages:

**After Registration (2 min delay):**
```
Hey {{contact.first_name}}! You're confirmed for Todd's FREE masterclass.
Quick question - what's the #1 thing you want to improve in your financial life?
Reply and let me know!
```

**Abandon Cart (5 min after no action):**
```
Hey {{contact.first_name}}, I noticed you didn't finish grabbing your VIP spot.
Todd's Real Estate eBook + replay + private Q&A is only $27.
Want me to send you the link?
```

**Abandon Cart (24 hours):**
```
Last chance {{contact.first_name}} - VIP spots are almost gone.
$27 gets you Todd's Real Estate eBook, replay, and private Q&A.
[UPGRADE LINK]
```

**72-Hour Reminder:**
```
Hey {{contact.first_name}}, just a reminder - Todd's FREE masterclass
is in 3 days! [DATE] @ 7PM ET. See you there!
```

**24-Hour Reminder:**
```
{{contact.first_name}} - Tomorrow's the day! Todd goes live at 7PM ET.
This is where everything changes. Don't miss it.
```

**1-Hour Reminder:**
```
{{contact.first_name}} we're going LIVE in 1 hour!
Grab your spot now: [ZOOM LINK]
```

**No Show Follow-up:**
```
Hey {{contact.first_name}}, we missed you at Todd's masterclass!
Want access to the replay? Reply YES and I'll send you the link.
```

---

## 12. CHECKLIST

Use this to track your progress:

### Custom Fields & Tags
- [x] Create Custom Field: `Masterclass 0226 - Date` ✅
- [x] Create Custom Field: `Masterclass 0226 - VIP Status` ✅
- [x] Create Custom Field: `Masterclass 0226 - Improvement Goal` ✅
- [ ] Create Tag: `Masterclass 0226 - Registered`
- [ ] Create Tag: `Masterclass 0226 - Feb 16`
- [ ] Create Tag: `Masterclass 0226 - Feb 18`
- [ ] Create Tag: `Masterclass 0226 - VIP - Feb 16`
- [ ] Create Tag: `Masterclass 0226 - VIP - Feb 18`
- [ ] Create Tag: `Masterclass 0226 - Free Confirmed`
- [ ] Create Tag: `Masterclass 0226 - Attended`
- [ ] Create Tag: `Masterclass 0226 - No Show`
- [ ] Create Tag: `Setter - Needs Outreach` (if not exists)
- [ ] Create Tag: `Setter - Contacted` (if not exists)

### Pipeline & Product
- [x] Create Pipeline: `Masterclass 0226 - Registration` with 7 stages ✅
- [ ] Create Product: `Masterclass 0226 - VIP Upgrade` ($27)

### Workflows
- [ ] Create Workflow 1: `Masterclass 0226 - New Registration`
- [ ] Create Workflow 2: `Masterclass 0226 - VIP Purchase`
- [ ] Create Workflow 3: `Masterclass 0226 - Free Confirmed`
- [ ] Create Workflow 4: `Masterclass 0226 - Abandon Cart Recovery`
- [ ] Create Workflow 5: `Masterclass 0226 - Reminders Feb 16`
- [ ] Create Workflow 6: `Masterclass 0226 - Reminders Feb 18`
- [ ] Create Workflow 7: `Masterclass 0226 - Post Attended`
- [ ] Create Workflow 8: `Masterclass 0226 - No Show`

### Smart Lists
- [ ] Create Smart List: `Masterclass 0226 - Feb 16 All`
- [ ] Create Smart List: `Masterclass 0226 - Feb 16 VIPs`
- [ ] Create Smart List: `Masterclass 0226 - Feb 18 All`
- [ ] Create Smart List: `Masterclass 0226 - Feb 18 VIPs`
- [ ] Create Smart List: `Masterclass 0226 - All VIPs`
- [ ] Create Smart List: `Masterclass 0226 - Abandon Cart`
- [ ] Create Smart List: `Masterclass 0226 - No Shows`

### Integrations
- [ ] Connect Zoom to GHL
- [ ] Create Zoom webinar for Feb 16
- [ ] Create Zoom webinar for Feb 18
- [ ] Set up webhook from registration page to GHL
- [ ] Update upgrade page to trigger `Masterclass 0226 - Free Confirmed` tag

### Email Templates (9 total)
- [ ] Masterclass 0226 - Confirmation
- [ ] Masterclass 0226 - VIP Welcome (eBook)
- [ ] Masterclass 0226 - Abandon Cart
- [ ] Masterclass 0226 - 72hr Reminder
- [ ] Masterclass 0226 - 24hr Reminder
- [ ] Masterclass 0226 - 1hr Reminder
- [ ] Masterclass 0226 - Attended (VIP)
- [ ] Masterclass 0226 - Attended (Free)
- [ ] Masterclass 0226 - No Show

### Final Testing
- [ ] Test registration → GHL contact created
- [ ] Test VIP purchase → correct tags applied
- [ ] Test "No thanks" click → Free Confirmed tag applied
- [ ] Test abandon cart (wait 15 min) → moves to Abandon Cart stage
- [ ] Verify reminder workflow timing
- [ ] Test full flow end-to-end

---

## QUICK REFERENCE: TAG LOGIC

**How to identify a VIP for a specific date:**
- Feb 16 VIP = Has tag `Masterclass 0226 - VIP - Feb 16`
- Feb 18 VIP = Has tag `Masterclass 0226 - VIP - Feb 18`
- Any VIP = Tag contains `Masterclass 0226 - VIP`

**How to identify registrants by date:**
- Feb 16 registrants = Has tag `Masterclass 0226 - Feb 16`
- Feb 18 registrants = Has tag `Masterclass 0226 - Feb 18`

**This prevents confusion because:**
1. All tags start with `Masterclass 0226` - clearly identifies the event
2. VIP tags include the date - you know exactly which session they upgraded for
3. Won't conflict with tags from other events (e.g., `Dallas Event - VIP`)

---

## NOTES FROM RAF

**Pro Tips:**
- Run ads 10-14 days before webinar
- Use Meta Ad Library to research competitors (ads running 3-4+ months = proven)
- 10-15 min before going live, rename Zoom to "STARTING NOW - Join Todd Live!" to trigger notifications
- Have setters text back immediately after registration
- Engage attendees during webinar (polls, questions, homework)
- Outbound call/text all registrants after for ticket sales

**VIP Offer ($27) includes:**
- Todd's "Real Estate for Dummies" eBook
- Recorded replay access
- 30-minute private Q&A session with Todd

**Urgency tactics:**
- "Limited to 20 VIP spots"
- 24-hour limited offer
- Bundle tickets if selling event tickets later
