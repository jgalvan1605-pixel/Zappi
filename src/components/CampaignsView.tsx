'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  TrendingUp, 
  CheckCircle2, 
  Eye, 
  Clock, 
  RefreshCw, 
  Plus, 
  Users,
  Play,
  ArrowUpRight
} from 'lucide-react';
import { CreateCampaignModal } from './CreateCampaignModal';

export function CampaignsView() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalDelivered: 0,
    totalRead: 0,
    deliveryRate: 99,
    readRate: 96
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleLaunchCampaign = async (campaignId: string) => {
    if (!confirm('¿Deseas disparar esta campaña a la audiencia seleccionada?')) return;
    setLaunchingId(campaignId);

    try {
      const res = await fetch('/api/campaigns/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
      } else {
        alert(`🎉 ¡Campaña completada! Enviados ${data.sentCount} mensajes.`);
        fetchCampaigns();
      }
    } catch (err: any) {
      alert(`Error al lanzar: ${err.message}`);
    } finally {
      setLaunchingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas de Broadcast */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Campañas</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">{stats.totalCampaigns}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Lanzadas & Borradores</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mensajes Enviados</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">{stats.totalSent}</div>
          <div className="text-[11px] text-zappi-emerald font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {stats.deliveryRate}% Entregabilidad
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasa de Lectura</span>
          <div className="text-2xl font-black text-zappi-purple mt-1">{stats.readRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Apertura en los primeros 10 min</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ROI Estimado</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">11.8x</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Retorno vs Coste Plantilla
          </div>
        </div>
      </div>

      {/* Barra de Acciones */}
      <div className="bg-white p-4 rounded-xl border border-zappi-border shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-zappi-midnight">Historial de Campañas WhatsApp</h3>
          <p className="text-xs text-slate-500">Supervisa la entrega, lectura y clics en tiempo real</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </button>
      </div>

      {/* Listado de Campañas */}
      <div className="bg-white rounded-xl border border-zappi-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Cargando campañas...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zappi-midnight">No tienes campañas creadas</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Crea tu primera campaña interactiva para enviar mensajes masivos a tus clientes de forma instantánea.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-zappi-emerald text-zappi-midnight font-bold text-xs px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Crear Campaña
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-zappi-border text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Campaña / Plantilla</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Audiencia</th>
                  <th className="py-3 px-4">Enviados</th>
                  <th className="py-3 px-4">Entregados</th>
                  <th className="py-3 px-4">Leídos</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-zappi-midnight">{camp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Plantilla: {camp.templateName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                        camp.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        camp.status === 'processing' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {camp.status === 'completed' ? 'Completada' : camp.status === 'processing' ? 'Enviando...' : 'Borrador'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                        {camp.targetAudience?.tag || 'Todos'} ({camp.totalTarget})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-zappi-midnight">
                      {camp.sentCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold">
                      {camp.deliveredCount}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-700 font-bold">
                      {camp.readCount}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(camp.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {camp.status === 'draft' && (
                        <button
                          onClick={() => handleLaunchCampaign(camp.id)}
                          disabled={launchingId === camp.id}
                          className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all shadow-xs inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {launchingId === camp.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                          Lanzar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Creador */}
      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchCampaigns()}
      />
    </div>
  );
}