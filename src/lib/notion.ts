import { Client } from '@notionhq/client';
import type { Task, TaskStatus, TaskPriority, TaskCategory, TimesheetEntry } from '@/types/task';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

// Helper to safely extract text from Notion rich text
function getRichText(property: unknown): string {
  if (!property || typeof property !== 'object') return '';
  const prop = property as { rich_text?: Array<{ plain_text: string }> };
  if (!prop.rich_text || !Array.isArray(prop.rich_text)) return '';
  return prop.rich_text.map((t) => t.plain_text).join('');
}

// Helper to safely extract title from Notion title property
function getTitle(property: unknown): string {
  if (!property || typeof property !== 'object') return '';
  const prop = property as { title?: Array<{ plain_text: string }> };
  if (!prop.title || !Array.isArray(prop.title)) return '';
  return prop.title.map((t) => t.plain_text).join('');
}

// Helper to safely extract select value
function getSelect(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const prop = property as { select?: { name: string } | null };
  return prop.select?.name || null;
}

// Helper to safely extract number
function getNumber(property: unknown): number {
  if (!property || typeof property !== 'object') return 0;
  const prop = property as { number?: number | null };
  return prop.number || 0;
}

// Helper to safely extract date
function getDate(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const prop = property as { date?: { start: string } | null };
  return prop.date?.start || null;
}

// Helper to safely extract relation IDs
function getRelation(property: unknown): string[] {
  if (!property || typeof property !== 'object') return [];
  const prop = property as { relation?: Array<{ id: string }> };
  if (!prop.relation || !Array.isArray(prop.relation)) return [];
  return prop.relation.map((r) => r.id);
}

// Helper to safely extract created/updated time
function getTimestamp(property: unknown): string {
  if (!property || typeof property !== 'object') return new Date().toISOString();
  const prop = property as { created_time?: string; last_edited_time?: string };
  return prop.created_time || prop.last_edited_time || new Date().toISOString();
}

// Helper to safely extract email
function getEmail(property: unknown): string | null {
  if (!property || typeof property !== 'object') return null;
  const prop = property as { email?: string | null };
  return prop.email || null;
}

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: 'Due date',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map((page) => {
      const props = (page as { properties: Record<string, unknown> }).properties;
      const pageWithTimestamps = page as { id: string; created_time: string; last_edited_time: string };

      return {
        id: pageWithTimestamps.id,
        title: getTitle(props['Name'] || props['Title']),
        aiTitle: getRichText(props['AI Title']) || undefined,
        status: (getSelect(props['Status']) as TaskStatus) || 'Not Started',
        dueDate: getDate(props['Due date'] || props['Due Date']),
        priority: (getSelect(props['Priority']) as TaskPriority) || 'Medium',
        hours: getNumber(props['Hours']),
        hoursUsed: getNumber(props['Hours Used'] || props['Hours used']),
        client: getRichText(props['Client']) || getSelect(props['Client']),
        category: (getSelect(props['Category']) as TaskCategory) || 'Other',
        parentTaskId: getRelation(props['Parent task'] || props['Parent Task'])[0] || null,
        subTaskIds: getRelation(props['Sub Tasks'] || props['Sub tasks'] || props['Subtasks']),
        createdAt: pageWithTimestamps.created_time,
        updatedAt: pageWithTimestamps.last_edited_time,
      };
    });
  } catch (error) {
    console.error('Error fetching tasks from Notion:', error);
    return [];
  }
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: taskId });
    const props = (page as { properties: Record<string, unknown> }).properties;
    const pageWithTimestamps = page as { id: string; created_time: string; last_edited_time: string };

    return {
      id: pageWithTimestamps.id,
      title: getTitle(props['Name'] || props['Title']),
      aiTitle: getRichText(props['AI Title']) || undefined,
      status: (getSelect(props['Status']) as TaskStatus) || 'Not Started',
      dueDate: getDate(props['Due date'] || props['Due Date']),
      priority: (getSelect(props['Priority']) as TaskPriority) || 'Medium',
      hours: getNumber(props['Hours']),
      hoursUsed: getNumber(props['Hours Used'] || props['Hours used']),
      client: getRichText(props['Client']) || getSelect(props['Client']),
      category: (getSelect(props['Category']) as TaskCategory) || 'Other',
      parentTaskId: getRelation(props['Parent task'] || props['Parent Task'])[0] || null,
      subTaskIds: getRelation(props['Sub Tasks'] || props['Sub tasks'] || props['Subtasks']),
      createdAt: pageWithTimestamps.created_time,
      updatedAt: pageWithTimestamps.last_edited_time,
    };
  } catch (error) {
    console.error('Error fetching task from Notion:', error);
    return null;
  }
}

export async function getTasksByClient(clientName: string): Promise<Task[]> {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        or: [
          {
            property: 'Client',
            rich_text: {
              contains: clientName,
            },
          },
          {
            property: 'Client',
            select: {
              equals: clientName,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Due date',
          direction: 'ascending',
        },
      ],
    });

    return response.results.map((page) => {
      const props = (page as { properties: Record<string, unknown> }).properties;
      const pageWithTimestamps = page as { id: string; created_time: string; last_edited_time: string };

      return {
        id: pageWithTimestamps.id,
        title: getTitle(props['Name'] || props['Title']),
        aiTitle: getRichText(props['AI Title']) || undefined,
        status: (getSelect(props['Status']) as TaskStatus) || 'Not Started',
        dueDate: getDate(props['Due date'] || props['Due Date']),
        priority: (getSelect(props['Priority']) as TaskPriority) || 'Medium',
        hours: getNumber(props['Hours']),
        hoursUsed: getNumber(props['Hours Used'] || props['Hours used']),
        client: getRichText(props['Client']) || getSelect(props['Client']),
        category: (getSelect(props['Category']) as TaskCategory) || 'Other',
        parentTaskId: getRelation(props['Parent task'] || props['Parent Task'])[0] || null,
        subTaskIds: getRelation(props['Sub Tasks'] || props['Sub tasks'] || props['Subtasks']),
        createdAt: pageWithTimestamps.created_time,
        updatedAt: pageWithTimestamps.last_edited_time,
      };
    });
  } catch (error) {
    console.error('Error fetching tasks by client from Notion:', error);
    return [];
  }
}

export async function updateTaskAITitle(taskId: string, aiTitle: string): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: taskId,
      properties: {
        'AI Title': {
          rich_text: [
            {
              text: {
                content: aiTitle,
              },
            },
          ],
        },
      },
    });
    return true;
  } catch (error) {
    console.error('Error updating AI title in Notion:', error);
    return false;
  }
}

// Get timesheet entries (if using a separate timesheet database)
export async function getTimesheetEntries(timesheetDatabaseId?: string): Promise<TimesheetEntry[]> {
  if (!timesheetDatabaseId) {
    // Generate mock timesheet data from tasks
    const tasks = await getTasks();
    return tasks
      .filter((task) => task.hoursUsed > 0)
      .map((task) => ({
        id: `${task.id}-timesheet`,
        taskId: task.id,
        taskName: task.title,
        hours: Math.floor(task.hoursUsed),
        minutes: Math.round((task.hoursUsed % 1) * 60),
        category: task.category,
        date: task.updatedAt,
      }));
  }

  try {
    const response = await notion.databases.query({
      database_id: timesheetDatabaseId,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map((page) => {
      const props = (page as { properties: Record<string, unknown> }).properties;
      const pageId = (page as { id: string }).id;

      return {
        id: pageId,
        taskId: getRelation(props['Task'])[0] || '',
        taskName: getTitle(props['Task Name'] || props['Name']),
        hours: Math.floor(getNumber(props['Hours']) || getNumber(props['Time'])),
        minutes: Math.round(((getNumber(props['Hours']) || getNumber(props['Time'])) % 1) * 60),
        category: (getSelect(props['Category']) as TaskCategory) || 'Other',
        date: getDate(props['Date']) || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error fetching timesheet entries from Notion:', error);
    return [];
  }
}

// Client type for the clients database
export interface NotionClient {
  id: string;
  name: string;
  email: string | null;
}

// Get all clients from the clients overview database
export async function getClients(): Promise<NotionClient[]> {
  const clientsDatabaseId = process.env.NOTION_CLIENTS_DATABASE_ID;

  if (!clientsDatabaseId) {
    console.warn('NOTION_CLIENTS_DATABASE_ID not configured');
    return [];
  }

  try {
    const response = await notion.databases.query({
      database_id: clientsDatabaseId,
    });

    return response.results.map((page) => {
      const props = (page as { properties: Record<string, unknown> }).properties;
      const pageId = (page as { id: string }).id;

      // Try to get email from various property names
      const email =
        getEmail(props['Email']) ||
        getRichText(props['Email']) ||
        getRichText(props['Contact Email']) ||
        null;

      return {
        id: pageId,
        name: getTitle(props['Name'] || props['Client Name'] || props['Title']),
        email,
      };
    }).filter((client) => client.name && client.email); // Only return clients with both name and email
  } catch (error) {
    console.error('Error fetching clients from Notion:', error);
    return [];
  }
}

// Get unique client names from tasks (fallback if no clients database)
export async function getUniqueClientNames(): Promise<string[]> {
  const tasks = await getTasks();
  const clients = new Set<string>();

  tasks.forEach((task) => {
    if (task.client) {
      clients.add(task.client);
    }
  });

  return Array.from(clients);
}
