import { Client } from '@notionhq/client';
import type { Task, TaskStatus, TaskPriority, TaskCategory, TimesheetEntry } from '@/types/task';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Format database ID with hyphens if needed (Notion expects UUID format)
function formatNotionId(id: string): string {
  if (!id || id.includes('-')) return id;
  // Convert 32-char hex to UUID format: 8-4-4-4-12
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

const DATABASE_ID = formatNotionId(process.env.NOTION_DATABASE_ID || '');

// Cache for client names (to avoid repeated API calls)
const clientNameCache = new Map<string, string>();

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
  const prop = property as { select?: { name: string } | null; status?: { name: string } | null };
  return prop.select?.name || prop.status?.name || null;
}

// Helper to find status from any property with 'status' in the name
function getSelectFromAnyStatusProp(props: Record<string, unknown>): string | null {
  for (const [name, value] of Object.entries(props)) {
    if (name.toLowerCase().includes('status')) {
      const result = getSelect(value);
      if (result) return result;
    }
  }
  return null;
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

// Helper to get the title of a related page (with caching)
async function getRelatedPageTitle(pageId: string): Promise<string> {
  // Check cache first
  if (clientNameCache.has(pageId)) {
    return clientNameCache.get(pageId) || '';
  }

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const props = (page as { properties: Record<string, unknown> }).properties;

    // Find the title property dynamically (it could be named anything)
    let title = '';
    for (const [, value] of Object.entries(props)) {
      const prop = value as { type?: string; title?: Array<{ plain_text: string }> };
      if (prop.type === 'title' && prop.title) {
        title = prop.title.map((t) => t.plain_text).join('');
        break;
      }
    }

    // Fallback to common property names
    if (!title) {
      title = getTitle(props['Name']) || getTitle(props['Title']) || getTitle(props['Client Name']) || getTitle(props['Client']) || '';
    }

    // Cache the result
    clientNameCache.set(pageId, title);
    return title;
  } catch (error) {
    console.error('Error fetching related page:', error);
    return '';
  }
}

// Helper to get client name from relation or text/select
async function getClientName(props: Record<string, unknown>): Promise<{ name: string | null; id: string | null }> {
  // Log all property names to find the Client field
  const propNames = Object.keys(props);

  // Try different property names for Client
  const clientPropNames = ['Client', 'client', 'Clients', 'clients', 'Customer', 'customer'];
  let clientProp: unknown = null;
  let foundPropName = '';

  for (const name of clientPropNames) {
    if (props[name]) {
      clientProp = props[name];
      foundPropName = name;
      break;
    }
  }

  // If not found, look for any property with 'client' in the name (case-insensitive)
  if (!clientProp) {
    for (const name of propNames) {
      if (name.toLowerCase().includes('client')) {
        clientProp = props[name];
        foundPropName = name;
        break;
      }
    }
  }

  if (!clientProp) {
    console.log('Client property not found. Available props:', propNames);
    return { name: null, id: null };
  }

  // First try as relation
  const clientRelation = getRelation(clientProp);
  if (clientRelation.length > 0) {
    const clientId = clientRelation[0];
    const clientName = await getRelatedPageTitle(clientId);
    return { name: clientName || null, id: clientId };
  }

  // Fall back to text or select
  const clientText = getRichText(clientProp) || getSelect(clientProp);
  return { name: clientText || null, id: null };
}

export async function getTasks(): Promise<Task[]> {
  try {
    // Get newest 100 tasks only (no pagination for speed)
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
      page_size: 100,
    });

    const tasks = await Promise.all(
      response.results.map(async (page) => {
        const props = (page as { properties: Record<string, unknown> }).properties;
        const pageWithTimestamps = page as { id: string; created_time: string; last_edited_time: string };

        // Get client info (handles both relation and text/select)
        const clientInfo = await getClientName(props);

        return {
          id: pageWithTimestamps.id,
          title: getTitle(props['Task name']) || getTitle(props['Name']) || getTitle(props['Title']),
          aiTitle: getRichText(props['AI Title']) || undefined,
          status: (getSelect(props['Status']) || getSelect(props['status']) || getSelectFromAnyStatusProp(props)) as TaskStatus || 'Not Started',
          dueDate: getDate(props['Due date']) || getDate(props['Due Date']),
          priority: (getSelect(props['Priority']) as TaskPriority) || 'Medium',
          hours: getNumber(props['Hours']) || getNumber(props['Estimated Hours']),
          hoursUsed: getNumber(props['Hours Used']) || getNumber(props['Hours used']) || getNumber(props['Time Spent']),
          client: clientInfo.name,
          clientId: clientInfo.id,
          category: (getSelect(props['Category']) as TaskCategory) || 'Other',
          parentTaskId: getRelation(props['Parent task'] || props['Parent Task'])[0] || null,
          subTaskIds: getRelation(props['Sub Tasks'] || props['Sub tasks'] || props['Subtasks']),
          createdAt: pageWithTimestamps.created_time,
          updatedAt: pageWithTimestamps.last_edited_time,
        };
      })
    );

    return tasks;
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

    const clientInfo = await getClientName(props);

    return {
      id: pageWithTimestamps.id,
      title: getTitle(props['Task name']) || getTitle(props['Name']) || getTitle(props['Title']),
      aiTitle: getRichText(props['AI Title']) || undefined,
      status: (getSelect(props['Status']) as TaskStatus) || 'Not Started',
      dueDate: getDate(props['Due date']) || getDate(props['Due Date']),
      priority: (getSelect(props['Priority']) as TaskPriority) || 'Medium',
      hours: getNumber(props['Hours']) || getNumber(props['Estimated Hours']),
      hoursUsed: getNumber(props['Hours Used']) || getNumber(props['Hours used']) || getNumber(props['Time Spent']),
      client: clientInfo.name,
      clientId: clientInfo.id,
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
    // First, get all tasks and filter by client name
    // This is needed because the client might be a relation
    const allTasks = await getTasks();

    return allTasks.filter((task) => {
      if (!task.client) return false;
      // Case-insensitive partial match
      return task.client.toLowerCase().includes(clientName.toLowerCase()) ||
             clientName.toLowerCase().includes(task.client.toLowerCase());
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
        name: getTitle(props['Name']) || getTitle(props['Client Name']) || getTitle(props['Title']),
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
