# Email Builder with Drag & Drop

**Nautilus Engineering · Full-Stack Engineer Take-Home**

## Getting Started

### Option A: Fork (recommended)

1. Click **Fork** on this repo to create your own copy
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/nautilus-email-builder.git
   cd nautilus-email-builder
   ```

### Option B: Clone directly

```bash
git clone https://github.com/xxxoooxoxo/nautilus-email-builder.git
cd nautilus-email-builder
```

> **⚠️ Important:** Do **not** push to this repository. Work on your own fork or a local copy only. If you cloned directly, remove the remote before starting:
> ```bash
> git remote remove origin
> ```

---

## Overview

A visual email builder that lets users compose, preview, and send emails using a drag-and-drop interface.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15+ (App Router) | Application framework |
| TypeScript (strict) | Type safety |
| React Email | Email-safe components |
| Resend | Email delivery |
| Puck Editor | Drag & drop builder |
| Temporal | Durable scheduling |

## Setup

```bash
# Install dependencies
npm install

# Copy env vars
cp .env.example .env.local
# Fill in your RESEND_API_KEY, etc.

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Sender email address (default: `onboarding@resend.dev`) |
| `TEMPORAL_ADDRESS` | Temporal server address (default: `localhost:7233`) |

### Temporal (for scheduling)

```bash
# Install Temporal CLI: https://docs.temporal.io/cli
temporal server start-dev
```

## Requirements

### Tier 1 — Must Have

- **Drag & Drop Email Builder** — Puck editor with React Email components (Button, Heading, Text, Image, Container, Section, etc...)
- **Component Property Editing** — Sidebar editing for colors, typography, sizing, image URLs, content & links
- **Live Email Preview** — Real-time preview updating as users edit
- **Email Sending** — Send via Resend with recipient input, subject line, status notifications
- **WYSIWYG** - Parity on editor with sent item

### Tier 2 — Expected

- **Email Scheduling** — Durable workflow via Temporal with date/time picker, scheduled email list, cancellation
- **Desktop & Mobile Preview** — Toggle between preview widths

### Tier 3 — Impress Us

- 3-5 more quality of life improvements

# Email Builder

A drag-and-drop email builder using Next.js, Puck, React Email, Resend, and Temporal.

**Live demo:** [Email Builder](https://nautilus-email-builder-production.up.railway.app/editor)

## What I built

- Twelve configurable blocks: Heading, Text, Button, Link, Image, Divider, Container, Section, Columns, inline code, code block, and Markdown.
- Nested layouts through Puck slots, featuring controls for content, colors, fonts, text sizes, image widths, and links.
- Live editing preview and immediate sending with recipient/subject inputs, validation, and status notifications.
- Scheduled sending, a scheduled-email list, and cancellation.
- Separate Railway app and worker services connected to Temporal Cloud.

Additional conveniences include font selection and text-size presets inspired by Gmail’s interface, Markdown and code blocks, and disabling Send while a request is in progress. The email controls sit above the editor for space and clarity. Puck’s Publish action is hidden to avoid redundancy.

## Architecture Decisions

### One shared rendering configuration

Using Puck’s `<Render>` inside React Email’s server renderer produced React hook/runtime errors. Claude Code suggested a browser-rendered workaround, but this introduced renderer warnings and required accepting client-generated HTML. Instead, I implemented a small hookless server renderer that reuses each block’s render function and recursively resolves nested slots.

This lets the editor and sent email use the same component definitions, though I’ll need to maintain the custom renderer as the builder changes. It helps keep their styling consistent, but different email clients can still display the same HTML differently.

### Snapshot scheduled content

The API renders HTML when scheduling and passes that snapshot to Temporal. Later editor changes cannot alter the scheduled email, and the worker does not need React or editor configuration. This allows the scheduled content to be sent as is, without accidental adjustments.

### Separate timing from delivery

I separated scheduling from sending so an email doesn’t depend on keeping the browser open or an API request running. Temporal remembers the send time, and an activity calls Resend when it’s due. Temporary failures get up to five total attempts, while permanent errors stop immediately because retrying won’t fix them. Each email keeps the same idempotency key across retries to help prevent duplicate sends within Resend’s retention window.

### Workflow-backed history

The list uses Temporal execution status and memo metadata rather than introducing a database. This keeps the demo small; however, history is limited by namespace retention.

### Server-side validation

I validate the recipient, subject, and content on the server because requests can bypass the UI. For scheduling, I also check that the send time is in the future and convert the picker’s local time to UTC so it represents the same moment across timezones. The server generates each email’s ID rather than relying on one supplied by the browser.

## Testing (sample emails)

I manually tested Gmail on desktop and iOS. Fonts, text sizes, links, buttons, dividers, Markdown, images, and columns were checked against the editor. I adjusted explicit typography, margins, and wrapper alignment during verification.

Known differences remain: heading appearance differed between the editor and Gmail, unavailable fonts can fall back to Arial, and columns remain side by side on narrow screens. Outlook and Apple Mail were not tested. Exact cross-client WYSIWYG parity is unfinished.

## Run locally

```bash
npm install
```

Copy `.env.example` to `.env.local` and supply your Resend and Temporal credentials. Start these in separate terminals:

```bash
npm run dev
```

```bash
npm run worker
```

Open [http://localhost:3000/editor](http://localhost:3000/editor).

The demo uses `onboarding@resend.dev`, which is subject to Resend’s test-sender recipient restrictions. Sending to other recipients requires an appropriately configured sender/domain.

## Limitations and next steps

There is no authentication or rate limiting, and visitors can access the shared scheduled-email list and cancellation endpoint. Before wider use, I’d protect these routes and add ownership checks.

Further improvements:

- Fixing heading parity
- Broader email-client testing
- Clearer error messages
- Automatic scheduled-email list refresh
- Color control wheel/grid
- Cleaner UI reflective of an email interface
- Multiple recipients
- Tracking recipient history for suggestions

## AI assistance and process
I used Claude Code extensively to help with implementation and debugging, but reviewed the code for errors. I manually verified the editor and tested multiple received emails in Gmail.


## Assumptions

- Each email has one recipient and one scheduled send time; recurring schedules are outside scope.
- Fonts depend on availability on the recipient’s device, with configured fallbacks.
- The date/time picker uses the user’s device timezone, then converts the selected time to UTC.
- Scheduling captures the email’s current content. Later edits do not update an existing scheduled email.
- If the worker is unavailable at the scheduled time, the email sends when execution resumes.
- Cancellation is intended for pending emails and cannot recall an email already accepted by Resend.
- This submission demonstrates a shared workspace. Separate user accounts and private email histories are outside the implemented scope.

## Time Spent

5 hours:
- 30 min plan
- 30 min setup, basic react page and config
- 1 hour completing all components and API routing
- 1 hour testing parity through test emails
- 1 hour setting up temporal and scheduling logic
- 30 min debugging
- 30 min writeup

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Puck Editor](https://puckeditor.com)
- [React Email](https://react.email)
- [Resend](https://resend.com)
- [Temporal](https://temporal.io)
