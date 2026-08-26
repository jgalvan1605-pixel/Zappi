'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Users, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MetaTemplateItem, PREBUILT_TEMPLATES } from '@/lib/metaTemplates';
import { WhatsAppPreview } from './WhatsAppPreview';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [templates, setTemplates] = useState<MetaTemplateItem[]>(PREBUILT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<MetaTemplateItem>(PREBUILT_TEMPLATES[0]);
  
  // Segmentación de Audiencia
  const [availableTags, setAvailableTags] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [audienceCount, setAudienceCount] = useState<number>(0);

  // Mapeo de Variables
  const [var1, setVar1] = useState('{{firstName}}');
  const [var2, setVar2] = useState('15%');
  const [var3, setVar3] = useState('ZAPPI15');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // 1. Cargar plantillas
      const resTpl = await fetch('/api/templates');
      const dataTpl = await resTpl.json();
      if (dataTpl.templates && dataTpl.templates.length > 0) {
        setTemplates(dataTpl.templates);
        setSelectedTemplate(dataTpl.templates[0]);
      }

      // 2. Cargar tags y conteo de contactos
      const resContacts = await fetch('/api/contacts');
      const dataContacts = await resContacts.json();
      if (dataContacts.tags) setAvailableTags(dataContacts.tags);
      if (dataContacts.pagination) setAudienceCount(dataContacts.pagination.total);
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setError(null);
      setCampaignName(`Campaña WhatsApp - ${new Date().toLocaleDateString('es-ES')}`);
    }
  }, [isOpen]);

  const handleLaunch = async () => {
    if (!campaignName.trim() || !selectedTemplate) {
      setError('Debes asignar un nombre a la campaña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Crear campaña en DB
      const resCreate = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName.trim(),
          templateName: selectedTemplate.name,
          templateParams: {
            bodyVariables: [var1, var2, var3]
          },
          targetAudience: {
            tag: selectedTag
          }
        })
      });

      const dataCreate = await resCreate.json();
      if (!resCreate.ok) {
        throw new Error(dataCreate.error || 'Error al crear campaña.');
      }

      // 2. Disparar el lanzamiento
      const resLaunch = await fetch('/api/campaigns/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: dataCreate.campaign.id
        })
      });

      const dataLaunch = await resLaunch.json();
      if (!resLaunch.ok) {
        throw new Error(dataLaunch.error || 'Error al disparar los mensajes.');
      }

      alert(`🎉 ¡Lanzamiento completado! Se enviaron ${dataLaunch.sentCount} mensajes.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zappi-border shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-zappi-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zappi-emerald-light text-zappi-emerald flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zappi-midnight">Lanzador Masivo de Campañas (Broadcast)</h3>
              <p className="text-xs text-slate-500">Configura tu mensaje con simulación móvil en tiempo real</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con 2 Columnas (Configuración a la izquierda, Simulador a la derecha) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          
          {/* Columna Izquierda: Ajustes de Campaña */}
          <div className="lg:col-span-7 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">Nombre de la Campaña</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej: Oferta Flash Black Friday"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white text-slate-900 font-medium"
              />
            </div>

            {/* Selector de Plantilla */}
            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1">
                Plantilla Oficial de WhatsApp (HSM)
              </label>
              <select
                value={selectedTemplate.name}
                onChange={(e) => {
                  const tpl = templates.find(t => t.name === e.target.value);
                  if (tpl) setSelectedTemplate(tpl);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl text-slate-900 font-medium"
              >
                {templates.map(t => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} ({t.category}) - {t.status === 'APPROVED' ? 'Aprobada ✓' : t.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Segmentación de Audiencia */}
            <div>
              <label className="block text-xs font-bold text-zappi-midnight mb-1 flex items-center justify-between">
                <span>Segmento de Audiencia Destinataria</span>
                <span className="text-[11px] text-zappi-emerald font-extrabold flex items-center gap-1">
                  <Users className="w-3 h-3" /> {audienceCount} contactos en base de datos
                </span>
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-zappi-border rounded-xl text-slate-900 font-medium"
              >
                <option value="ALL">👥 Todos los contactos ({audienceCount})</option>
                {availableTags.map(t => (
                  <option key={t.name} value={t.name}>
                    🏷️ {t.name} ({t.count} contactos)
                  </option>
                ))}
              </select>
            </div>

            {/* Inyección Dinámica de Variables */}
            <div className="bg-slate-50 p-4 rounded-xl border border-zappi-border space-y-3">
              <span className="text-xs font-extrabold text-zappi-midnight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zappi-purple" />
                Mapeo de Variables Dinámicas
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Variable {`{{1}}`}</label>
                  <input
                    type="text"
                    value={var1}
                    onChange={(e) => setVar1(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Variable {`{{2}}`}</label>
                  <input
                    type="text"
                    value={var2}
                    onChange={(e) => setVar2(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Variable {`{{3}}`}</label>
                  <input
                    type="text"
                    value={var3}
                    onChange={(e) => setVar3(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Botón de Lanzamiento */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLaunch}
                disabled={loading}
                className="w-full bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Disparando Campaña...' : '🚀 Lanzar Campaña de WhatsApp Ahora'}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Previsualización en Vivo de WhatsApp */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
              Simulador en Vivo WhatsApp
            </span>
            <WhatsAppPreview
              template={selectedTemplate}
              variables={{ '{{1}}': var1, '{{2}}': var2, '{{3}}': var3 }}
            />
          </div>

        </div>

      </div>
    </div>
  );
}