'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
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
          <h1 className="text-2xl font-black text-zappi-midnight tracking-tight">Crea tu cuenta en Zappi</h1>
          <p className="text-xs text-slate-500">«El marketing que tus clientes sí abren.»</p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="bg-white p-8 rounded-3xl border border-zappi-border shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Javier Galván"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Nombre de tu Marca o Tienda</label>
              <input
                type="text"
                placeholder="Ej: Akon Fitness / Pummba"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Correo Electrónico Corporativo</label>
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
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Contraseña Segura</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Creando tu cuenta...' : 'Comenzar Prueba Gratuita (250 msgs)'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-zappi-purple font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}