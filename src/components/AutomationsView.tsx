'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Plus, 
  ShoppingBag,
  ArrowUpRight,
  RefreshCw,
  Power
} from 'lucide-react';
import { CreateAutomationModal } from './CreateAutomationModal';

export function AutomationsView() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeCount: 0,
    totalRecoveredEstimated: '14.250 €',
    avgConversionRate: '19.4%'
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automations');
      const data = await res.json();
      if (data.automations) {
        setAutomations(data.automations);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/automations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      fetchAutomations();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta automatización?')) return;
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' });
      fetchAutomations();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas de Automatizaciones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flujos Activos</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">{stats.activeCount}</div>
          <div className="text-[11px] text-zappi-emerald font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> En piloto automático 24/7
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Recuperadas</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.totalRecoveredEstimated}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Carritos de ticket medio ~450€
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversión Media</span>
          <div className="text-2xl font-black text-zappi-purple mt-1">{stats.avgConversionRate}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">vs 2.5% estándar de email</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conector Shopify</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">Activo</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Webhooks checkouts/orders</div>
        </div>
      </div>

      {/* Barra de Acciones */}
      <div className="bg-white p-4 rounded-xl border border-zappi-border shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-zappi-midnight">Flujos de Conversión en Piloto Automático</h3>
          <p className="text-xs text-slate-500">Secuencias activadas por eventos de compra de tus clientes</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Automatización
        </button>
      </div>

      {/* Listado de Automatizaciones */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-zappi-border flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Cargando flujos...
          </div>
        ) : automations.map((flow) => (
          <div
            key={flow.id}
            className="bg-white p-5 rounded-2xl border border-zappi-border shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                flow.isActive ? 'bg-emerald-100 text-zappi-emerald' : 'bg-slate-100 text-slate-400'
              }`}>
                <Zap className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-zappi-midnight">{flow.name}</h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    flow.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {flow.isActive ? 'Activo 24/7' : 'Pausado'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-zappi-purple" />
                    Trigger: <strong className="text-slate-700">{flow.triggerType}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Retardo: <strong className="text-slate-700">20 minutos</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Controles de Estado */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleActive(flow.id, flow.isActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  flow.isActive 
                    ? 'bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700' 
                    : 'bg-zappi-emerald text-zappi-midnight hover:bg-zappi-emerald-hover'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {flow.isActive ? 'Pausar' : 'Activar'}
              </button>

              <button
                onClick={() => handleDelete(flow.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Eliminar flujo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Creador */}
      <CreateAutomationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchAutomations()}
      />
    </div>
  );
}