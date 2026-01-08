# Notion Live Dashboard

A live client dashboard that syncs with your Notion database, featuring AI-generated titles and real-time task tracking.

## Features

- **Live Notion Sync**: Real-time synchronization with your Notion database
- **AI-Generated Titles**: Use OpenAI to generate professional, engaging task titles
- **Task Dashboard**: Kanban-style board with Design and Development columns
- **Time Tracking**: Monthly timesheet view with remaining hours indicator
- **Rolling Hours**: Track hours used vs. allocated with visual progress
- **Client-Specific Views**: Filter tasks by client using `/client/[name]` routes
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

### 1. Set Up Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token
4. Share your database with the integration

### 2. Database Structure

Your Notion database should have these properties:

| Property | Type | Description |
|----------|------|-------------|
| Name/Title | Title | Task name |
| Status | Select | Pending Review, In Progress, Completed, On Hold, Not Started |
| Due date | Date | Task due date |
| Priority | Select | High, Medium, Low |
| Hours | Number | Allocated hours |
| Hours Used | Number | Hours already used |
| Client | Text/Select | Client name |
| Category | Select | Design, Development, Navigation, Shopify Functions, Other |
| AI Title | Text | (Optional) AI-generated title |
| Parent task | Relation | (Optional) Parent task relation |
| Sub Tasks | Relation | (Optional) Subtasks relation |

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
OPENAI_API_KEY=your_openai_api_key
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

## Routes

- `/` - Main dashboard showing all tasks
- `/client/[name]` - Client-specific dashboard (e.g., `/client/about-time.com`)

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard:
   - `NOTION_API_KEY`
   - `NOTION_DATABASE_ID`
   - `OPENAI_API_KEY`
4. Deploy!

## API Endpoints

### GET /api/tasks

Fetch all tasks or filter by client.

```
GET /api/tasks
GET /api/tasks?client=ClientName
```

### POST /api/generate-title

Generate an AI title for a task.

```json
POST /api/generate-title
{
  "taskId": "notion-page-id"
}
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Database**: Notion API
- **AI**: OpenAI GPT-3.5
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Deployment**: Vercel

## License

MIT
