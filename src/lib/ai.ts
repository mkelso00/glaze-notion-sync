import OpenAI from 'openai';
import type { Task } from '@/types/task';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function generateAITitle(task: Task): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, returning original title');
    return task.title;
  }

  try {
    const client = getOpenAIClient();
    const prompt = `Generate a concise, professional, and engaging title for this project task. The title should be clear and action-oriented.

Task Details:
- Original Title: ${task.title}
- Category: ${task.category}
- Priority: ${task.priority}
- Status: ${task.status}
- Client: ${task.client || 'N/A'}

Generate only the title, nothing else. Keep it under 60 characters.`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional project manager who creates clear, concise task titles.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 60,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || task.title;
  } catch (error) {
    console.error('Error generating AI title:', error);
    return task.title;
  }
}

export async function generateProjectSummary(tasks: Task[]): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Project update not available.';
  }

  try {
    const client = getOpenAIClient();
    const taskList = tasks
      .slice(0, 10)
      .map((t) => `- ${t.title} (${t.status}, ${t.priority} priority)`)
      .join('\n');

    const prompt = `Summarize the following project tasks in 2-3 sentences for a client dashboard:

${taskList}

Focus on overall progress and key priorities.`;

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional project manager providing concise status updates to clients.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || 'Project update not available.';
  } catch (error) {
    console.error('Error generating project summary:', error);
    return 'Project update not available.';
  }
}
