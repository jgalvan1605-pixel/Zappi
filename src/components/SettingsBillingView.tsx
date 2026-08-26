'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Zap, 
  Plus, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { CREDIT_PACKAGES } from '@/lib/stripe';

export function SettingsBillingView() {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/billing/status');
      const data = await res.json();
      setBillingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      setCheckoutLoading(planId);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.simulated) {
        alert(data.message);
        fetchStatus();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleBuyCredits = async (creditPackageId: string) => {
    try {
      setCheckoutLoading(creditPackageId);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditPackageId })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.simulated) {
        alert(data.message);
        fetchStatus();
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        alert(data.message);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" /> Cargando datos de suscripción y facturación...
      </div>
    );
  }

  const org = billingData?.organization;
  const plans = billingData?.availablePlans || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* 1. Tarjeta de Resumen de Cuota y Créditos Disponibles */}
      <div className="bg-gradient-to-r from-zappi-midnight to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-zappi-emerald uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full">
              Plan Activo: {org?.planDetails?.name || 'Pro Growth'}
            </span>
            <span className="text-xs text-slate-400">• Renovación automática</span>
          </div>

          <h3 className="text-2xl font-black text-white">
            {org?.messageCredits?.toLocaleString()} <span className="text-base font-semibold text-slate-400">mensajes disponibles</span>
          </h3>

          {/* Barra de Consumo Mensual */}
          <div className="space-y-1.5 pt-2 max-w-md">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>Consumo mensual</span>
              <strong>{org?.messagesSentThisMonth || 0} / {org?.monthlyQuota?.toLocaleString()} ({org?.usagePercent}%)</strong>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-zappi-emerald to-zappi-purple h-full rounded-full transition-all duration-500"
                style={{ width: `${org?.usagePercent || 5}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Acciones de Facturación */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={handleOpenCustomerPortal}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-3 rounded-xl border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Descargar Facturas
          </button>
        </div>
      </div>

      {/* 2. Planes de Suscripción SaaS */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-zappi-midnight">Planes de Suscripción Mensual</h3>
          <p className="text-xs text-slate-500">Escala tus envíos según el volumen de clientes de tu e-commerce</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p: any) => {
            const isCurrent = org?.plan === p.id;
            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all relative ${
                  p.isPopular 
                    ? 'border-zappi-purple shadow-xl ring-2 ring-zappi-purple/20' 
                    : 'border-zappi-border shadow-sm hover:border-slate-300'
                }`}
              >
                {p.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zappi-purple text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                    ⭐ Opción Recomendada
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-extrabold text-zappi-midnight">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zappi-midnight">{p.priceMonthly} €</span>
                    <span className="text-xs text-slate-400 font-semibold">/ mes</span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Incluye:
                    </span>
                    {p.features?.map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-zappi-emerald shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent || checkoutLoading === p.id}
                    className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : p.isPopular
                        ? 'bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight shadow-md'
                        : 'bg-zappi-midnight hover:bg-slate-800 text-white'
                    }`}
                  >
                    {checkoutLoading === p.id && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {isCurrent ? 'Plan Actual ✓' : `Cambiar a ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Paquetes Extra de Recarga de Mensajes */}
      <div className="bg-white p-6 rounded-2xl border border-zappi-border shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-extrabold text-zappi-midnight flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-zappi-emerald" />
            Recarga Rápida de Créditos Extra
          </h4>
          <p className="text-xs text-slate-500">¿Necesitas saldo adicional para una campaña puntual de Black Friday o Rebajas? Los créditos nunca caducan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-zappi-midnight">{pkg.name}</div>
                <div className="text-[11px] text-emerald-700 font-bold">+{pkg.credits.toLocaleString()} mensajes</div>
              </div>
              <button
                onClick={() => handleBuyCredits(pkg.id)}
                disabled={checkoutLoading === pkg.id}
                className="bg-white hover:bg-emerald-50 text-zappi-midnight font-bold text-xs px-4 py-2 rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5"
              >
                {checkoutLoading === pkg.id && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Comprar por {pkg.price} €
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}