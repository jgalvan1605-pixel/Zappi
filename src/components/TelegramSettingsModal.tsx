'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Smartphone,
  Info
} from 'lucide-react';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TelegramSettingsModal({ isOpen, onClose, onSuccess }: TelegramSettingsModalProps) {
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const shopifyWebhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/shopify` 
    : 'https://tudominio.com/api/webhooks/shopify';

  useEffect(() => {
    if (isOpen) {
      fetch('/api/telegram/connect')
        .then(res => res.json())
        .then(data => {
          if (data.organization?.telegramChatId) {
            setChatId(data.organization.telegramChatId);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (testNow: boolean = true) => {
    if (testNow) setTesting(true);
    else setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramChatId: chatId, testNow })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: testNow ? '¡Alerta de prueba enviada con éxito a tu Telegram!' : 'Configuración guardada.' });
        if (onSuccess) onSuccess();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Error al conectar con Telegram.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error de red al conectar.' });
    } finally {
      setLoading(false);
      setTesting(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(shopifyWebhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-zappi-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zappi-midnight p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zappi-emerald text-zappi-midnight flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Canal Comercial de Telegram & Shopify</h3>
              <p className="text-xs text-slate-300">Vinculación en 2 pasos para alertas de carritos en tiempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* PASO 1: Vincular Telegram */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zappi-midnight uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-zappi-emerald text-zappi-midnight flex items-center justify-center text-[10px] font-black">1</span>
                Vincular tu Telegram para Alertas (Asesor Comercial)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">0 € Meta</span>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Para recibir las alertas de carritos con el botón de 1-clic a WhatsApp:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium pl-1">
                <li>Abre Telegram y busca el bot oficial: <strong className="text-zappi-purple font-mono">@ZappiAlertsBot</strong></li>
                <li>Pulsa el botón <strong className="text-slate-900 font-bold">Iniciar</strong> (Start).</li>
                <li>Pega aquí tu <strong className="text-slate-900 font-bold">Chat ID</strong> (Tu ID de usuario de Telegram):</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej: 1034043897"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 font-bold focus:ring-2 focus:ring-zappi-emerald focus:outline-hidden"
              />
              <button
                onClick={() => handleSaveAndTest(true)}
                disabled={testing || !chatId}
                className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {testing ? 'Enviando...' : 'Probar Alerta en Vivo'}
              </button>
            </div>
          </div>

          {/* PASO 2: Webhook de Shopify */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zappi-midnight uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-zappi-purple text-white flex items-center justify-center text-[10px] font-black">2</span>
                Conectar con tu Tienda Shopify
              </span>
              <span className="text-[10px] font-bold text-slate-500">2 Minutos</span>
            </div>

            <p className="text-xs text-slate-600">
              En tu panel de Shopify ve a <strong>Ajustes ➔ Notificaciones ➔ Webhooks</strong> y crea un webhook para <strong>Checkouts abandonados</strong> con esta URL:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shopifyWebhookUrl}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-[11px] font-mono text-slate-700 select-all"
              />
              <button
                onClick={copyWebhook}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-zappi-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Mensaje de Estado */}
          {statusMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Info className="w-4 h-4 text-red-600" />}
              {statusMsg.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={() => handleSaveAndTest(false)}
            disabled={loading}
            className="bg-zappi-midnight hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-black transition-all"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}