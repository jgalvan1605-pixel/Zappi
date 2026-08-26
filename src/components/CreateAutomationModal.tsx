'use client';

import React, { useState } from 'react';
import { X, Zap, Clock, Send, Sparkles, ArrowDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PREBUILT_RECIPES, AutomationRecipe } from '@/lib/automationsEngine';

interface CreateAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateAutomationModal({ isOpen, onClose, onSuccess }: CreateAutomationModalProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<AutomationRecipe>(PREBUILT_RECIPES[0]);
  const [customName, setCustomName] = useState(PREBUILT_RECIPES[0].name);
  const [delayMinutes, setDelayMinutes] = useState(20);
  const [discountCode, setDiscountCode] = useState('ZAPPI10');
  const [discountPercent, setDiscountPercent] = useState('10%');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRecipe = (recipe: AutomationRecipe) => {
    setSelectedRecipe(recipe);
    setCustomName(recipe.name);
  };

  const handleSaveAutomation = async () => {
    setLoading(true);
    setError(null);

    const steps = [
      { id: 'step_1', type: 'TRIGGER', config: { triggerType: selectedRecipe.triggerType } },
      { id: 'step_2', type: 'DELAY', config: { delayMinutes } },
      {
        id: 'step_3',
        type: 'SEND_WHATSAPP',
        config: {
          templateName: selectedRecipe.steps.find(s => s.type === 'SEND_WHATSAPP')?.config.templateName || 'recuperacion_carrito_vip',
          discountCode,
          discountPercent
        }
      }
    ];

    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName.trim(),
          triggerType: selectedRecipe.triggerType,
          flowData: steps,
          isActive: true
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear flujo');
      }

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
      <div className="bg-white rounded-2xl border border-zappi-border shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-zappi-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-zappi-purple flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zappi-midnight">Crear Flujo Automático de WhatsApp</h3>
              <p className="text-xs text-slate-500">Recupera ventas y fideliza clientes en piloto automático</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* 1. Recetas Preconfiguradas */}
          <div>
            <label className="block text-xs font-bold text-zappi-midnight mb-2 uppercase tracking-wider">
              1. Selecciona una Receta Probada
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PREBUILT_RECIPES.map((recipe) => {
                const isSelected = selectedRecipe.id === recipe.id;
                return (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe)}
                    className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                      isSelected
                        ? 'border-zappi-purple bg-indigo-50/50 ring-2 ring-zappi-purple/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                      {recipe.category}
                    </span>
                    <h4 className="text-xs font-extrabold text-zappi-midnight leading-snug">{recipe.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">{recipe.description}</p>
                    <div className="text-[10px] font-bold text-emerald-700 pt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {recipe.estimatedRoi}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Visualizador del Flujo Drag & Drop en Cascada */}
          <div className="bg-slate-50 p-5 rounded-xl border border-zappi-border space-y-3">
            <label className="block text-xs font-bold text-zappi-midnight uppercase tracking-wider">
              2. Configuración Visual de la Secuencia
            </label>

            {/* Nodo 1: Trigger */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-zappi-emerald flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Paso 1 • Disparador</div>
                <div className="text-xs font-bold text-zappi-midnight">
                  {selectedRecipe.triggerType === 'shopify_abandoned_cart' && 'Cliente abandona carrito en Shopify'}
                  {selectedRecipe.triggerType === 'shopify_order_paid' && 'Cliente completa compra en Shopify'}
                  {selectedRecipe.triggerType === 'vip_reactivation' && 'Cliente inactivo por más de 30 días'}
                </div>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Nodo 2: Delay */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Paso 2 • Tiempo de Espera</div>
                  <div className="text-xs font-bold text-zappi-midnight">Esperar antes de enviar</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-20 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                />
                <span className="text-xs font-semibold text-slate-600">minutos</span>
              </div>
            </div>

            <div className="flex justify-center text-slate-400">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Nodo 3: Acción WhatsApp */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-zappi-purple flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Paso 3 • Acción Automática</div>
                  <div className="text-xs font-bold text-zappi-midnight">Enviar Plantilla HSM de WhatsApp</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código Descuento"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="w-24 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                />
                <input
                  type="text"
                  placeholder="% Descuento"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-16 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAutomation}
              disabled={loading}
              className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Activando...' : 'Activar Flujo Automático'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}