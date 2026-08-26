'use client';

import React, { useState, useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';
import DashboardApp from '@/components/DashboardApp';

export default function RootPage() {
  const [session, setSession] = useState<{ authenticated: boolean; user?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setSession(data);
      } catch {
        setSession({ authenticated: false });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zappi-surface flex items-center justify-center text-xs text-slate-400 font-medium">
        <div className="w-8 h-8 rounded-xl bg-zappi-emerald flex items-center justify-center font-black text-base text-zappi-midnight animate-pulse shadow-md">
          ⚡
        </div>
      </div>
    );
  }

  // Si el usuario tiene sesión activa, mostrar directamente el Dashboard
  if (session?.authenticated) {
    return <DashboardApp currentUser={session.user} />;
  }

  // Si es un visitante nuevo, mostrar la Landing Page comercial
  return <LandingPage />;
}