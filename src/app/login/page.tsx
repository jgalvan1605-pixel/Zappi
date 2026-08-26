'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, AlertTriangle, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales no válidas');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zappi-surface flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zappi-emerald flex items-center justify-center font-extrabold text-2xl text-zappi-midnight shadow-lg shadow-emerald-500/20 mx-auto">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-zappi-midnight tracking-tight">Acceder a Zappi</h1>
          <p className="text-xs text-slate-500">Panel de Control de Marketing Conversacional</p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-3xl border border-zappi-border shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@marca.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Iniciando sesión...' : 'Entrar a mi Panel'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            ¿No tienes cuenta todavía?{' '}
            <Link href="/register" className="text-zappi-purple font-bold hover:underline">
              Crea una aquí gratis
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}