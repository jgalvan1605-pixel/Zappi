'use client';

import React, { useState } from 'react';
import { InboxView } from './InboxView';
import { CampaignsView } from './CampaignsView';
import { AutomationsView } from './AutomationsView';
import { AudiencesView } from './AudiencesView';
import { SettingsBillingView } from './SettingsBillingView';
import { WhatsAppSettingsModal } from './WhatsAppSettingsModal';
import { TelegramSettingsModal } from './TelegramSettingsModal';
import { ImportCsvModal } from './ImportCsvModal';
import { CreateCampaignModal } from './CreateCampaignModal';
import { CreateAutomationModal } from './CreateAutomationModal';
import { RoiCalculator } from './RoiCalculator';

interface DashboardAppProps {
  initialTab?: string;
}

export default function DashboardApp({ initialTab = 'overview' }: DashboardAppProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modales
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [showImportCsvModal, setShowImportCsvModal] = useState<boolean>(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState<boolean>(false);
  const [showCreateAutomationModal, setShowCreateAutomationModal] = useState<boolean>(false);
  const [showRoiCalculator, setShowRoiCalculator] = useState<boolean>(false);

  const navItems = [
    { id: 'overview', label: 'Panel General', icon: '📈' },
    { id: 'conversations', label: 'Inbox en Vivo', icon: '💬', badge: 'Live' },
    { id: 'campaigns', label: 'Campañas (Broadcast)', icon: '🚀' },
    { id: 'automations', label: 'Automatizaciones', icon: '⚡' },
    { id: 'audiences', label: 'Audiencias & Contactos', icon: '👥' },
    { id: 'billing', label: 'Facturación & Planes', icon: '💳' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans antialiased overflow-x-hidden">
      {/* ================= CABECERA MÓVIL ================= */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">Zappi</span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">By Elena Carrera</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 active:scale-95 transition"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* ================= BACKDROP MÓVIL ================= */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Desktop */}
          <div className="hidden md:flex items-center gap-3 p-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-lg tracking-tight">Zappi</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">By Elena Carrera · Alta Joyería</p>
            </div>
          </div>

          {/* Navegación */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-slate-950 text-emerald-400'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              setShowTelegramModal(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-left text-xs transition"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="font-semibold text-slate-200">Alertas Telegram</p>
                <p className="text-[10px] text-slate-400">Conectado (@ZappiAlertsBot)</p>
              </div>
            </div>
            <span className="text-slate-400">⚙️</span>
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[10px]">
                EC
              </div>
              <span className="truncate max-w-[120px]">Atelier Elena</span>
            </div>
            <a href="/login" className="hover:text-rose-400 transition" title="Cerrar sesión">
              🚪
            </a>
          </div>
        </div>
      </aside>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <main className="flex-1 w-full min-w-0 bg-slate-950 overflow-y-auto min-h-screen">
        {activeTab === 'overview' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Panel General de Rendimiento
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  «El marketing y la atención VIP que tus clientes sí abren.»
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowRoiCalculator(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700 hover:text-white transition flex items-center gap-1.5"
                >
                  <span>🧮</span>
                  <span>Calculadora ROI</span>
                </button>
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WhatsApp Cloud API</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Ventas Recuperadas
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">14.250 €</p>
                <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
                  <span>↗</span>
                  <span className="font-semibold">+19.4%</span>
                  <span className="text-slate-400 text-[11px]">conversión carritos</span>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Tasa de Apertura
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-2">96.8%</p>
                <p className="text-[11px] text-slate-400 mt-2">Media industria: ~20% (Email)</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Flujos Automáticos
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">3 Activos</p>
                <p className="text-[11px] text-slate-400 mt-2">Carritos 20m + Alertas Telegram</p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
                <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Contactos VIP
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">2.480</p>
                <p className="text-[11px] text-slate-400 mt-2">100% Opt-in verificado RGPD</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <span>🚀</span> Lanzar Broadcast VIP
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Envía novedades de la Colección Ópera o promociones exclusivas con plantillas oficiales de Meta.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateCampaignModal(true)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition shadow-lg shadow-indigo-600/20"
                >
                  Crear Campaña Instantánea
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <span>📥</span> Importar Base de Datos
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Carga clientes desde archivo CSV o sincroniza directamente con Shopify Atelier.
                  </p>
                </div>
                <button
                  onClick={() => setShowImportCsvModal(true)}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 border border-slate-700 transition"
                >
                  Importar Contactos (CSV / Shopify)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && <InboxView />}
        {activeTab === 'campaigns' && <CampaignsView />}
        {activeTab === 'automations' && <AutomationsView />}
        {activeTab === 'audiences' && <AudiencesView />}
        {activeTab === 'billing' && <SettingsBillingView />}
      </main>

      {/* ================= MODALES ================= */}
      <WhatsAppSettingsModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
      <TelegramSettingsModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
      />
      <ImportCsvModal
        isOpen={showImportCsvModal}
        onClose={() => setShowImportCsvModal(false)}
      />
      <CreateCampaignModal
        isOpen={showCreateCampaignModal}
        onClose={() => setShowCreateCampaignModal(false)}
      />
      <CreateAutomationModal
        isOpen={showCreateAutomationModal}
        onClose={() => setShowCreateAutomationModal(false)}
      />
      {showRoiCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowRoiCalculator(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>
            <RoiCalculator />
          </div>
        </div>
      )}
    </div>
  );
}