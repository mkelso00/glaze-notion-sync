'use client';

import { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard';
import { LoginForm } from './LoginForm';

interface ProtectedDashboardProps {
  clientName: string;
  isAuthenticated: boolean;
}

export function ProtectedDashboard({ clientName, isAuthenticated: initialAuth }: ProtectedDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginForm clientName={clientName} onSuccess={handleLoginSuccess} />;
  }

  return <Dashboard clientName={clientName} />;
}
