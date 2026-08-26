'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Key, CheckCircle2, AlertTriangle, Send, ShieldCheck, RefreshCw } from 'lucide-react';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WhatsAppSettingsModal({ isOpen, onClose, onSuccess }: WhatsAppSettingsModalProps) {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentHealth, setCurrentHealth] = useState<any>(null);

  // Formulario de prueba
  const [testPhone, setTestPhone] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setFetching(true);
      const res = await fetch('/api/whatsapp/connect');
      const data = await res.json();
      if (data.organization) {
        if (data.organization.phoneNumberId) setPhoneNumberId(data.organization.phoneNumberId);
        if (data.organization.wabaId) setWabaId(data.organization.wabaId);
        if (data.organization.health) setCurrentHealth(data.organization.health);
      }
    } catch {
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setError(null);
      setSuccessMsg(null);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wabaId: wabaId.trim() || undefined,
          phoneNumberId: phoneNumberId.trim(),
          accessToken: accessToken.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar WhatsApp');
      }

      setSuccessMsg(data.message);
      setCurrentHealth(data.health);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          type: 'template',
          templateName: 'hello_world'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al enviar');
      }

      setTestResult({ success: true, message: data.message });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zappi-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-zappi-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zappi-emerald-light text-zappi-emerald flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zappi-midnight">Conexión Meta WhatsApp Cloud API</h3>
              <p className="text-xs text-slate-500">Configura tu número oficial y credenciales de acceso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado de Salud de Meta */}
          {currentHealth && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-zappi-emerald shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    {currentHealth.display_phone_number} ({currentHealth.verified_name || 'Verificado'})
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
                      {currentHealth.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700">Calidad del Número: {currentHealth.quality_rating}</div>
                </div>
              </div>
              <span className="text-xs text-emerald-800 font-bold">Conectado ✓</span>
            </div>
          )}

          {/* Formulario de Conexión */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">
                Phone Number ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 104829381920394"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 transition-all text-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Lo encuentras en tu consola de Meta for Developers &gt; WhatsApp &gt; API Setup.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">
                WhatsApp Business Account ID (WABA ID)
              </label>
              <input
                type="text"
                placeholder="Ej: 108394829102934"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 transition-all text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">
                Permanent Access Token (Meta System User Token) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="EAAG..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 transition-all text-slate-900 font-mono"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Se encriptará con algoritmo seguro AES-256-GCM antes de guardarse en la base de datos.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-zappi-emerald" />
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? 'Verificando con Meta...' : 'Guardar y Verificar Conexión'}
            </button>
          </form>

          {/* Sección de Prueba de Envío en Vivo */}
          <div className="pt-6 border-t border-zappi-border">
            <h4 className="text-xs font-extrabold text-zappi-midnight mb-2 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-zappi-purple" />
              Enviar Mensaje de Prueba en Vivo (Plantilla Hello World)
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Envía la plantilla oficial de bienvenida de Meta a tu número personal para verificar que todo el canal está operativo.
            </p>

            <form onSubmit={handleSendTest} className="flex gap-2">
              <input
                type="text"
                placeholder="+34600000000"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                required
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-purple/40 text-slate-900 font-mono"
              />
              <button
                type="submit"
                disabled={testLoading}
                className="bg-zappi-purple hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {testLoading ? 'Enviando...' : 'Enviar Prueba'}
              </button>
            </form>

            {testResult && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-zappi-emerald" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {testResult.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}