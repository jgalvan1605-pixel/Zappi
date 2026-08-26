'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Zap, 
  TrendingUp,
  CreditCard,
  LogOut,
  SendHorizontal,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { TelegramSettingsModal } from '@/components/TelegramSettingsModal';
import { AudiencesView } from '@/components/AudiencesView';
import { CampaignsView } from '@/components/CampaignsView';
import { CreateCampaignModal } from '@/components/CreateCampaignModal';
import { InboxView } from '@/components/InboxView';
import { AutomationsView } from '@/components/AutomationsView';
import { SettingsBillingView } from '@/components/SettingsBillingView';

interface DashboardAppProps {
  currentUser?: any;
}

export default function DashboardApp({ currentUser }: DashboardAppProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'audiences' | 'automations' | 'inbox' | 'billing'>('overview');
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ isConfigured: boolean; chatId?: string } | null>(null);

  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/connect');
      const data = await res.json();
      if (data.organization) {
        setTelegramStatus({
          isConfigured: data.organization.isConfigured,
          chatId: data.organization.telegramChatId
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {}
  };

  // Carritos reales de By Elena Carrera para la vista en vivo
  const recentAbandonedCarts = [
    {
      id: 'cart_1',
      customer: 'Ignacio Gómez-Acebo',
      phone: '+34622998877',
      product: 'Solitario Oro Blanco 18k Diamante Colección Bubbles',
      amount: '2.590 €',
      time: 'Hace 14 min',
      status: 'Alerta Enviada al Asesor',
      tag: 'Compromiso'
    },
    {
      id: 'cart_2',
      customer: 'Beatriz de la Vega',
      phone: '+34612345678',
      product: 'Alianza en Oro Blanco 18k con Diamantes Texturas 6mm',
      amount: '5.800 €',
      time: 'Hace 38 min',
      status: 'WhatsApp Abierto por Asesor',
      tag: 'VIP La Moraleja'
    },
    {
      id: 'cart_3',
      customer: 'Sofía Álvarez de Toledo',
      phone: '+34655112233',
      product: 'Pendientes de Aro 30mm Oro Rosa 18k con Diamantes Mariposa',
      amount: '2.995 €',
      time: 'Hace 1 h',
      status: 'Venta Recuperada ✓',
      tag: 'Colección Mariposas'
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-zappi-surface">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-zappi-midnight text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo & Marca */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zappi-emerald flex items-center justify-center font-extrabold text-xl text-zappi-midnight shadow-lg shadow-emerald-500/20">
                ⚡
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Zappi <span className="text-[10px] bg-zappi-purple text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
                </h1>
                <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                  {currentUser?.organizationName || 'By Elena Carrera'}
                </p>
              </div>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Panel General
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'inbox'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                Inbox en Vivo
              </div>
              <span className="text-[10px] bg-zappi-purple px-2 py-0.5 rounded-full text-white font-bold">Live</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              Campañas (Broadcast)
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'automations'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              Automatizaciones
            </button>

            <button
              onClick={() => setActiveTab('audiences')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'audiences'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Audiencias & Contactos
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'billing'
                  ? 'bg-zappi-emerald text-zappi-midnight font-bold shadow-md shadow-emerald-500/10'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Facturación & Planes
            </button>
          </nav>
        </div>

        {/* Footer del Sidebar con Telegram Status */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            className="w-full text-left bg-slate-900/80 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${telegramStatus?.isConfigured ? 'bg-zappi-emerald animate-pulse' : 'bg-amber-400'}`}></div>
              <div>
                <div className="text-[11px] font-bold text-slate-200">
                  {telegramStatus?.isConfigured ? 'Alertas Telegram' : 'Vincular Telegram'}
                </div>
                <div className="text-[9px] text-slate-400">
                  {telegramStatus?.isConfigured ? 'Conectado ✓ (@ZappiAlertsBot)' : 'Configurar Canal ⚙'}
                </div>
              </div>
            </div>
            <SendHorizontal className={`w-3.5 h-3.5 ${telegramStatus?.isConfigured ? 'text-zappi-emerald' : 'text-slate-500'}`} />
          </button>

          <div className="flex items-center justify-between pt-1 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                {currentUser?.name?.slice(0, 1) || 'A'}
              </div>
              <span className="truncate text-[11px] text-slate-300">{currentUser?.name || 'Asesora Atelier'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all" 
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Superior */}
        <header className="h-16 border-b border-zappi-border bg-white px-8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-zappi-midnight">
              {activeTab === 'overview' && 'Panel General de Rendimiento'}
              {activeTab === 'inbox' && 'Bandeja Unificada de Mensajes'}
              {activeTab === 'campaigns' && 'Campañas Masivas de WhatsApp (Broadcast)'}
              {activeTab === 'automations' && 'Flujos de Conversión & Carritos Abandonados'}
              {activeTab === 'audiences' && 'Gestión de Audiencias & Segmentos'}
              {activeTab === 'billing' && 'Planes de Suscripción & Facturación'}
            </h2>
            <p className="text-xs text-slate-500">«El marketing que tus clientes sí abren.»</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-zappi-midnight text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-zappi-purple" />
              Alertas Telegram / Shopify
            </button>
            <button
              onClick={() => setIsCreateCampaignOpen(true)}
              className="flex items-center gap-2 bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Nueva Campaña
            </button>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Tarjetas de Métricas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventas Recuperadas</span>
                  <div className="text-2xl font-black text-zappi-midnight mt-1">14.250 €</div>
                  <div className="text-[11px] text-zappi-emerald font-semibold flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3 h-3" /> +19.4% conversión en carritos
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasa de Apertura</span>
                  <div className="text-2xl font-black text-zappi-purple mt-1">96.8%</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Media industria: ~20% (Email)</div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flujos Automáticos</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">3 Activos</div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Carritos 20m + Alertas Telegram
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-xs">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contactos Activos</span>
                  <div className="text-2xl font-black text-zappi-midnight mt-1">3.180</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-1">Normalizados E.164 (+34)</div>
                </div>
              </div>

              {/* Banner de Vinculación de Telegram (Human-in-the-Loop) */}
              <div className="bg-gradient-to-r from-zappi-midnight to-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 max-w-xl">
                  <span className="text-[11px] font-extrabold text-zappi-emerald uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                    Canal Comercial • 0 € Costes Meta
                  </span>
                  <h3 className="text-lg font-extrabold mt-2 text-white">Canal de Alertas Instantáneas en Telegram</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Recibe los carritos abandonados de Shopify en tu móvil con un botón directo para abrir WhatsApp y enviar el mensaje personalizado en 1 solo clic.
                  </p>
                </div>
                <button
                  onClick={() => setIsTelegramModalOpen(true)}
                  className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0"
                >
                  <SendHorizontal className="w-4 h-4" />
                  {telegramStatus?.isConfigured ? 'Gestionar Alertas Telegram' : 'Vincular Telegram en 30s'}
                </button>
              </div>

              {/* Tabla de Carritos Detectados en Tiempo Real */}
              <div className="bg-white rounded-2xl border border-zappi-border overflow-hidden shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black text-zappi-midnight">Últimos Carritos & Leads Detectados</h3>
                    <p className="text-xs text-slate-500">Monitorización de checkouts de Shopify y alertas enviadas al equipo de ventas.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronización Shopify Activa
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3">Cliente</th>
                        <th className="pb-3">Pieza / Carrito</th>
                        <th className="pb-3">Importe</th>
                        <th className="pb-3">Tiempo</th>
                        <th className="pb-3">Estado Alerta</th>
                        <th className="pb-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {recentAbandonedCarts.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="py-3.5">
                            <div className="font-bold text-slate-900">{item.customer}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{item.phone}</div>
                          </td>
                          <td className="py-3.5 max-w-xs">
                            <div className="truncate font-medium text-slate-800">{item.product}</div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">{item.tag}</span>
                          </td>
                          <td className="py-3.5 font-black text-slate-900 font-mono text-sm">
                            {item.amount}
                          </td>
                          <td className="py-3.5 text-slate-400 font-medium">
                            {item.time}
                          </td>
                          <td className="py-3.5">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hola ${item.customer.split(' ')[0]}! 👋 Vi que estuviste viendo nuestra pieza en By Elena Carrera. ¿Tienes alguna duda con la talla o te gustaría reservar una cita en nuestro Atelier de El Encinar? ✨`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              Abrir WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'billing' && <SettingsBillingView />}
          {activeTab === 'automations' && <AutomationsView />}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'audiences' && <AudiencesView />}
        </div>
      </main>

      {/* Modal de Conexión de Telegram y Shopify */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onSuccess={() => {
          fetchTelegramStatus();
          setIsTelegramModalOpen(false);
        }}
      />

      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onSuccess={() => {
          setActiveTab('campaigns');
        }}
      />
    </div>
  );
}