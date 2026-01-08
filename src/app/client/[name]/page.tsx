import { Dashboard } from '@/components/Dashboard';

interface ClientPageProps {
  params: Promise<{
    name: string;
  }>;
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { name } = await params;
  const clientName = decodeURIComponent(name);

  return <Dashboard clientName={clientName} />;
}

export async function generateMetadata({ params }: ClientPageProps) {
  const { name } = await params;
  const clientName = decodeURIComponent(name);

  return {
    title: `${clientName} Dashboard - Notion Sync`,
    description: `Live dashboard for ${clientName} powered by Notion and AI`,
  };
}
