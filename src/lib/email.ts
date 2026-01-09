import { Resend } from 'resend';
import type { Task } from '@/types/task';
import { format, parseISO, differenceInDays } from 'date-fns';

let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface ClientInfo {
  name: string;
  email: string;
}

export async function sendWeeklySummaryEmail(
  client: ClientInfo,
  tasks: Task[],
  dashboardUrl: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured');
    return false;
  }

  const fromEmail = process.env.EMAIL_FROM || 'dashboard@yourdomain.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Project Dashboard';

  // Calculate summary stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Investigating').length;
  const onHoldTasks = tasks.filter((t) => t.status === 'On Hold' || t.status === 'Mark to Brief').length;
  const totalHours = tasks.reduce((sum, t) => sum + t.hours, 0);
  const usedHours = tasks.reduce((sum, t) => sum + t.hoursUsed, 0);

  // Get upcoming tasks (due in next 7 days)
  const upcomingTasks = tasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'Completed') return false;
      const daysUntilDue = differenceInDays(parseISO(t.dueDate), new Date());
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    })
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
    });

  // Get high priority tasks
  const highPriorityTasks = tasks.filter(
    (t) => t.priority === 'High' && t.status !== 'Completed'
  );

  const emailHtml = generateEmailHtml({
    clientName: client.name,
    totalTasks,
    completedTasks,
    inProgressTasks,
    onHoldTasks,
    totalHours,
    usedHours,
    upcomingTasks,
    highPriorityTasks,
    dashboardUrl,
  });

  try {
    const client_ = getResendClient();
    await client_.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: client.email,
      subject: `Weekly Project Update - ${client.name}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${client.email}:`, error);
    return false;
  }
}

interface EmailData {
  clientName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  onHoldTasks: number;
  totalHours: number;
  usedHours: number;
  upcomingTasks: Task[];
  highPriorityTasks: Task[];
  dashboardUrl: string;
}

function generateEmailHtml(data: EmailData): string {
  const {
    clientName,
    totalTasks,
    completedTasks,
    inProgressTasks,
    onHoldTasks,
    totalHours,
    usedHours,
    upcomingTasks,
    highPriorityTasks,
    dashboardUrl,
  } = data;

  const remainingHours = totalHours - usedHours;

  const formatDueDate = (task: Task) => {
    if (!task.dueDate) return 'No date';
    const daysUntilDue = differenceInDays(parseISO(task.dueDate), new Date());
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const upcomingTasksHtml = upcomingTasks.length > 0
    ? upcomingTasks
        .slice(0, 5)
        .map(
          (t) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
              <strong>${t.title}</strong>
              <br><span style="color: #666; font-size: 13px;">${t.category}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: ${t.priority === 'High' ? '#ef4444' : '#666'};">
              ${t.priority}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; color: #10b981;">
              ${formatDueDate(t)}
            </td>
          </tr>
        `
        )
        .join('')
    : '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #666;">No upcoming tasks this week</td></tr>';

  const highPriorityHtml = highPriorityTasks.length > 0
    ? highPriorityTasks
        .slice(0, 3)
        .map(
          (t) => `
          <li style="margin-bottom: 8px;">
            <strong>${t.title}</strong> - ${t.status}
          </li>
        `
        )
        .join('')
    : '<li style="color: #666;">No high priority tasks</li>';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: #09090b; color: white; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="margin: 0 0 10px 0; font-size: 24px;">Weekly Project Update</h1>
    <p style="margin: 0; opacity: 0.8;">${clientName} - ${format(new Date(), 'MMMM d, yyyy')}</p>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 16px 16px;">

    <!-- Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
      <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; font-weight: bold; color: #10b981;">${completedTasks}</div>
        <div style="color: #666; font-size: 14px;">Completed</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${inProgressTasks}</div>
        <div style="color: #666; font-size: 14px;">In Progress</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; font-weight: bold; color: #f59e0b;">${onHoldTasks}</div>
        <div style="color: #666; font-size: 14px;">On Hold</div>
      </div>
      <div style="background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; font-weight: bold; color: #09090b;">${totalTasks}</div>
        <div style="color: #666; font-size: 14px;">Total Tasks</div>
      </div>
    </div>

    <!-- Hours Summary -->
    <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 15px 0; font-size: 16px;">Hours Summary</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>Total Hours:</span>
        <strong>${totalHours}h</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span>Used:</span>
        <strong>${usedHours}h</strong>
      </div>
      <div style="display: flex; justify-content: space-between; color: #10b981;">
        <span>Remaining:</span>
        <strong>${remainingHours}h</strong>
      </div>
      <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin-top: 15px; overflow: hidden;">
        <div style="background: #10b981; height: 100%; width: ${totalHours > 0 ? Math.min((usedHours / totalHours) * 100, 100) : 0}%; border-radius: 4px;"></div>
      </div>
    </div>

    <!-- Upcoming Tasks -->
    <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 15px 0; font-size: 16px;">Upcoming This Week</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; font-size: 13px; color: #666;">Task</th>
            <th style="padding: 10px; text-align: left; font-size: 13px; color: #666;">Priority</th>
            <th style="padding: 10px; text-align: left; font-size: 13px; color: #666;">Due</th>
          </tr>
        </thead>
        <tbody>
          ${upcomingTasksHtml}
        </tbody>
      </table>
    </div>

    <!-- High Priority -->
    <div style="background: #fef2f2; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #fecaca;">
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #dc2626;">High Priority Items</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${highPriorityHtml}
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        View Full Dashboard
      </a>
    </div>

  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>This is an automated weekly summary from your project dashboard.</p>
  </div>

</body>
</html>
  `;
}
