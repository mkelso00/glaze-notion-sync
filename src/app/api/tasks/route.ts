import { NextResponse } from 'next/server';
import { getTasks, getTasksByClient } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client');

    // Always get all tasks first for debugging
    const allTasks = await getTasks();
    const allClientNames = [...new Set(allTasks.map(t => t.client).filter(Boolean))];

    console.log('All tasks count:', allTasks.length);
    console.log('All client names found:', allClientNames);
    console.log('Requested client:', client);

    let tasks;
    if (client) {
      tasks = await getTasksByClient(client);
      console.log('Filtered tasks count:', tasks.length);
    } else {
      tasks = allTasks;
    }

    return NextResponse.json({
      tasks,
      success: true,
      debug: {
        totalTasks: allTasks.length,
        clientNames: allClientNames,
        requestedClient: client,
        matchedTasks: tasks.length
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', success: false },
      { status: 500 }
    );
  }
}
