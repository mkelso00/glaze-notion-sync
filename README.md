# Notion Live Dashboard

A live client dashboard that syncs with your Notion database, featuring AI-generated titles, password-protected client views, and weekly email summaries.

## Features

- **Live Notion Sync**: Real-time synchronization with your Notion database
- **AI-Generated Titles**: Use OpenAI to generate professional, engaging task titles
- **Task Dashboard**: Kanban-style board with Design and Development columns
- **Time Tracking**: Monthly timesheet view with remaining hours indicator
- **Rolling Hours**: Track hours used vs. allocated with visual progress
- **Client-Specific Views**: Filter tasks by client using `/client/[name]` routes
- **Password Protection**: Each client has their own password (updated yearly)
- **Weekly Email Summaries**: Automatic Monday morning emails to each client
- **Auto-Refresh**: Dashboard automatically refreshes every 30 seconds

## Screenshots Reference

The dashboard displays:
- Task cards with status, priority, due dates, and hours
- Timesheet with time entries by category (Design, Development)
- Remaining hours circle indicator
- Kanban board organized by task category

## Getting Started

### Prerequisites

- Node.js 18+
- A Notion account with an integration
- OpenAI API key (for AI title generation)
- Resend API key (for weekly emails)

### 1. Set Up Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token
4. Share your databases with the integration

### 2. Database Structure

**Tasks Database** - Your main task database:

| Property | Type | Description |
|----------|------|-------------|
| Name/Title | Title | Task name |
| Status | Select | Pending Review, In Progress, Completed, On Hold, Not Started |
| Due date | Date | Task due date |
| Priority | Select | High, Medium, Low |
| Hours | Number | Allocated hours |
| Hours Used | Number | Hours already used |
| Client | Text/Select | Client name (must match clients database) |
| Category | Select | Design, Development, Navigation, Shopify Functions, Other |
| AI Title | Text | (Optional) AI-generated title |

**Clients Database** - For weekly emails:

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Client name (must match Client field in tasks) |
| Email | Email/Text | Client's email address for weekly summaries |

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Notion
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_tasks_database_id
NOTION_CLIENTS_DATABASE_ID=your_clients_database_id

# AI
OPENAI_API_KEY=your_openai_api_key

# Client Passwords (JSON format)
CLIENT_PASSWORDS={"about-time.com": "password2025", "other-client": "secret123"}

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=dashboard@yourdomain.com
EMAIL_FROM_NAME=Project Dashboard
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Cron Security
CRON_SECRET=your_random_secret
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Client Access

### Password Protection

Each client accesses their dashboard at `/client/[client-name]`:
- `https://your-app.vercel.app/client/about-time.com`

Passwords are set in the `CLIENT_PASSWORDS` environment variable as JSON:
```json
{"about-time.com": "yearlyPassword2025", "acme-corp": "anotherPassword"}
```

To update passwords yearly, just update this env var in Vercel.

### Weekly Email Summaries

Every Monday at 9:00 AM (UTC), each client with an email in the Clients database receives:
- Task status summary (completed, in progress, pending review)
- Hours used vs. remaining
- Upcoming tasks due this week
- High priority items
- Link to their dashboard

## Routes

- `/` - Main dashboard (all tasks, no password)
- `/client/[name]` - Client-specific dashboard (password protected)

## API Endpoints

### GET /api/tasks
Fetch all tasks or filter by client.
```
GET /api/tasks
GET /api/tasks?client=ClientName
```

### POST /api/auth/login
Authenticate a client.
```json
POST /api/auth/login
{
  "clientName": "about-time.com",
  "password": "yearlyPassword"
}
```

### POST /api/generate-title
Generate an AI title for a task.
```json
POST /api/generate-title
{
  "taskId": "notion-page-id"
}
```

### GET /api/cron/weekly-email
Trigger weekly email send (protected by CRON_SECRET).

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard (see above)
4. Vercel Cron is automatically configured via `vercel.json`
5. Deploy!

### Required Vercel Environment Variables

| Variable | Description |
|----------|-------------|
| `NOTION_API_KEY` | Notion integration token |
| `NOTION_DATABASE_ID` | Tasks database ID |
| `NOTION_CLIENTS_DATABASE_ID` | Clients database ID |
| `OPENAI_API_KEY` | OpenAI API key |
| `CLIENT_PASSWORDS` | JSON object of client passwords |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email address |
| `EMAIL_FROM_NAME` | Sender name |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel app URL |
| `CRON_SECRET` | Random secret for cron protection |

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Notion API
- **AI**: OpenAI GPT-3.5
- **Email**: Resend
- **Cron**: Vercel Cron
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Deployment**: Vercel

## License

MIT
