import { NextResponse } from 'next/server';
import { getClients, getTasksByClient } from '@/lib/notion';
import { sendWeeklySummaryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for sending all emails

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (or has the secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Get all clients with email addresses
    const clients = await getClients();

    if (clients.length === 0) {
      return NextResponse.json({
        message: 'No clients with email addresses found',
        success: true,
        emailsSent: 0,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';
    const results: { client: string; success: boolean; error?: string }[] = [];

    // Send email to each client
    for (const client of clients) {
      if (!client.email) continue;

      try {
        // Get tasks for this client
        const tasks = await getTasksByClient(client.name);

        if (tasks.length === 0) {
          results.push({
            client: client.name,
            success: true,
            error: 'No tasks found, email skipped',
          });
          continue;
        }

        // Generate dashboard URL for this client
        const dashboardUrl = `${baseUrl}/client/${encodeURIComponent(client.name)}`;

        // Send the email
        const success = await sendWeeklySummaryEmail(
          { name: client.name, email: client.email },
          tasks,
          dashboardUrl
        );

        results.push({
          client: client.name,
          success,
          error: success ? undefined : 'Failed to send email',
        });
      } catch (error) {
        results.push({
          client: client.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success && !r.error?.includes('skipped')).length;
    const skippedCount = results.filter((r) => r.error?.includes('skipped')).length;
    const failedCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Weekly emails processed: ${successCount} sent, ${skippedCount} skipped, ${failedCount} failed`,
      results,
      emailsSent: successCount,
    });
  } catch (error) {
    console.error('Weekly email cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process weekly emails',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
