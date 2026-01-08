import { NextResponse } from 'next/server';
import { getTaskById, updateTaskAITitle } from '@/lib/notion';
import { generateAITitle } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required', success: false },
        { status: 400 }
      );
    }

    const task = await getTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found', success: false },
        { status: 404 }
      );
    }

    const aiTitle = await generateAITitle(task);

    // Update the task in Notion with the AI-generated title
    await updateTaskAITitle(taskId, aiTitle);

    return NextResponse.json({
      aiTitle,
      success: true,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI title', success: false },
      { status: 500 }
    );
  }
}
