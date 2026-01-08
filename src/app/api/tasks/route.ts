import { NextResponse } from 'next/server';
import { getTasks, getTasksByClient } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client');

    let tasks;
    if (client) {
      tasks = await getTasksByClient(client);
    } else {
      tasks = await getTasks();
    }

    return NextResponse.json({ tasks, success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', success: false },
      { status: 500 }
    );
  }
}
