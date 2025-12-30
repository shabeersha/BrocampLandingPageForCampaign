# Zoho Integration Plan for Landing Page

This guide outlines how to integrate **Zoho CRM** or **Zoho Forms** into your existing landing page to capture leads directly from the current "Talk to our career expert" forms.

## Option 1: Zoho CRM Web-to-Lead (Recommended)
This method pushes data directly to your Zoho CRM "Leads" module.

### Step 1: Generate Web-to-Lead Logic
1.  **Login to Zoho CRM**.
2.  Go to **Settings (Gear Icon) -> Developer Space -> Webforms**.
3.  Click **Create Web Form** (for Leads module).
4.  **Drag and drop** fields that match your website form:
    *   First Name `(First Name)`
    *   Last Name `(Last Name)`
    *   Email `(Email)`
    *   Phone `(Phone/Mobile)`
    *   *Custom Field*: Qualification (`Student`, `Fresher`, etc.) - Create this picklist in Zoho first if needed.
    *   *Custom Field*: Language (`Malayalam`, `Tamil`) - Create picklist if needed.
5.  Click **Next Step**.
6.  **Form Location URL**: Enter your website URL (e.g., `https://brototype.com`).
7.  **Landing Page URL**: Enter the URL to redirect to after success (e.g., a `/thank-you.html` page, or just `https://brototype.com/?success=true`).
8.  **Copy the Code**: Zoho will generate HTML code. You do **not** need the full HTML, just the key hidden inputs and action URL.

### Step 2: Extract Key Information
From the generated Zoho code, find:
1.  `<form action='https://crm.zoho.com/crm/WebToLeadForm' ...>` (The URL might be slightly different depending on your data center, e.g., `.in` or `.com`).
2.  Hidden Input: `xnQsjsdp` (Your specific portal ID).
3.  Hidden Input: `zc_gad` (if present).
4.  Hidden Input: `xmIwtLD` (Form specific ID).
5.  Hidden Input: `actionType` (Usually `TLeads`).

### Step 3: Implement in `index.html`
Modify your existing `<form>` tags (`#popupForm` and `#leadForm`) to include these hidden inputs and use the Zoho `action`.

**Example Code Structure:**

```html
<form id="popupForm" action="https://crm.zoho.in/crm/WebToLeadForm" method="POST">
    <!-- Zoho Hidden Fields -->
    <input type="text" style="display:none;" name="xnQsjsdp" value="YOUR_PORTAL_ID_HERE">
    <input type="text" style="display:none;" name="xmIwtLD" value="YOUR_FORM_ID_HERE">
    <input type="text" style="display:none;" name="actionType" value="TLeads">
    <input type="text" style="display:none;" name="returnURL" value="https://yourwebsite.com/thank-you">

    <!-- Your Existing Fields (Ensure 'name' attributes match Zoho's) -->
    <input type="text" name="First Name" required placeholder="First Name"> <!-- Zoho expects "First Name" usually -->
    <input type="text" name="Last Name" required placeholder="Last Name">
    ...
</form>
```

**Important**: You **must** change the `name` attributes of your input fields (`firstName` -> `First Name`, `email` -> `Email`) to exactly match what Zoho expects. You can see the required names in the generated code from Step 1.

### Step 4: Handle Form Submission (AJAX vs Redirect)
**Option A (Standard/Redirect)**: Use the code above. The page will reload and go to `returnURL` on success. This is robust but less smooth.

**Option B (AJAX/JS)**: Keep your user on the page (preserve your "Success Popup").
*   *Constraint*: Zoho does not natively support CORS for Web-to-Lead, meaning you cannot just `fetch()` to their URL from the browser.
*   *Workaround*: You need a small backend proxy (like a Netlify Function or Vercel API route) to modify the headers, OR use **Zoho Flow / Zapier**.

---

## Option 2: Third-Party Integration (Zapier / Make) - Easiest for Static Sites
If you want to keep your current JavaScript submission logic (using Google Sheets or just `fetch`):

1.  **Trigger**: Send your form data to a **Zapier Webhook** URL instead of Google Sheets.
2.  **Zapier Action**: Create a "Zap" that listens to that Webhook and then **Create Module Entry** in Zoho CRM.
3.  **Benefit**: You don't need to change `name` attributes or deal with Zoho's HTML redirect. You just change the `scriptURL` in your `script.js`.

**Implementation:**
1.  Go to `script.js`.
2.  Replace existing `scriptURL` (Google Script) with your Zapier Webhook URL.
3.  Configure Zapier to map `firstName`, `phone`, etc. to Zoho CRM fields.

---

## Option 3: Zoho Forms (Embed)
If you don't mind replacing the UI:
1.  Create a form in **Zoho Forms**.
2.  Get the **Embed Code** (JS or Iframe).
3.  Replace your `<form>` HTML block with this embed code.
    *   *Pros*: Automatic integration, validation handled by Zoho.
    *   *Cons*: Might not match your "Premium" custom CSS exactly without extensive styling work.

---

## Recommendation
Since you have a highly customized "Premium" UI with specific popups and success messages:
**Use Option 2 (Zapier/Make)** or stay with **Option 1 (Web-to-Lead) using a hidden Iframe target**.

**Hidden Iframe Trick (To avoid page reload with Option 1):**
1.  Add `<iframe name="zoho-frame" style="display:none;"></iframe>` to your page.
2.  Add `target="zoho-frame"` to your `<form>` tag.
3.  In `script.js`, listen for the `submit` event, let it submit to the iframe, and then manually show your "Success UI" overlapping the form.
