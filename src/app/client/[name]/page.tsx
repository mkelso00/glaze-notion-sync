import { ProtectedDashboard } from '@/components/ProtectedDashboard';
import { verifyClientAccess, getClientPassword } from '@/lib/auth';

interface ClientPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { name } = await params;
  const clientName = decodeURIComponent(name);

  // Check if client has a password configured
  const hasPassword = getClientPassword(clientName) !== null;

  // If no password configured, show dashboard directly
  if (!hasPassword) {
    const { Dashboard } = await import('@/components/Dashboard');
    return <Dashboard clientName={clientName} />;
  }

  // Check if user is authenticated
  const isAuthenticated = await verifyClientAccess(clientName);

  return <ProtectedDashboard clientName={clientName} isAuthenticated={isAuthenticated} />;
}

export async function generateMetadata({ params }: ClientPageProps) {
  const { name } = await params;
  const clientName = decodeURIComponent(name);

  return {
    title: `${clientName} Dashboard`,
    description: `Live dashboard for ${clientName}`,
  };
}
