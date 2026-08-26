'use client';

import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RoiCalculator() {
  const [monthlyOrders, setMonthlyOrders] = useState<number>(350);
  const [averageTicket, setAverageTicket] = useState<number>(180);

  // Estimación matemática estándar de e-commerce:
  // Por cada 100 pedidos completados, se inician aprox 250 checkouts (60-70% abandono).
  // Total carritos abandonados al mes:
  const abandonedCarts = Math.round(monthlyOrders * 2.2);
  // Con Zappi se recupera entre el 15% y el 22% de carritos abandonados por WhatsApp (usamos 17% conservador):
  const recoveredCarts = Math.round(abandonedCarts * 0.17);
  const recoveredRevenueMonthly = Math.round(recoveredCarts * averageTicket);
  const recoveredRevenueAnnual = recoveredRevenueMonthly * 12;

  // Retorno de la inversión vs plan Pro de Zappi (49€/mes):
  const roiMultiplier = Math.round(recoveredRevenueMonthly / 49);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-zappi-midnight rounded-3xl p-8 md:p-12 text-white border border-slate-800 shadow-2xl space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-[11px] font-extrabold text-zappi-emerald uppercase tracking-wider bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Calculadora de Impacto Financiero
          </span>
          <h3 className="text-2xl font-black text-white mt-2">¿Cuánto dinero estás dejando escapar en carritos?</h3>
          <p className="text-xs text-slate-400">Ajusta los datos reales de tu tienda online para ver tu facturación recuperable con Zappi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sliders de Configuración */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
              <span>Pedidos mensuales completados en tu tienda:</span>
              <span className="text-base font-black text-zappi-emerald font-mono">{monthlyOrders.toLocaleString()} pedidos/mes</span>
            </div>
            <input
              type="range"
              min="50"
              max="3000"
              step="25"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(Number(e.target.value))}
              className="w-full accent-zappi-emerald bg-slate-800 h-2.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>50</span>
              <span>1.500</span>
              <span>3.000+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
              <span>Ticket Medio de Venta (AOV):</span>
              <span className="text-base font-black text-zappi-purple font-mono">{averageTicket} €</span>
            </div>
            <input
              type="range"
              min="30"
              max="1200"
              step="10"
              value={averageTicket}
              onChange={(e) => setAverageTicket(Number(e.target.value))}
              className="w-full accent-zappi-purple bg-slate-800 h-2.5 rounded-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>30 €</span>
              <span>600 €</span>
              <span>1.200 €+</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Carritos abandonados estimados al mes:</span>
              <strong className="text-slate-200 font-mono">~{abandonedCarts.toLocaleString()} carritos</strong>
            </div>
            <div className="flex justify-between">
              <span>Carritos recuperados con secuencia Zappi (17%):</span>
              <strong className="text-zappi-emerald font-mono">+{recoveredCarts.toLocaleString()} ventas extras</strong>
            </div>
          </div>
        </div>

        {/* Resultado en Vivo de Facturación Recuperable */}
        <div className="bg-slate-950/80 p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Facturación Adicional Estimada
          </span>

          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-mono">
              +{recoveredRevenueMonthly.toLocaleString('es-ES')} €
            </div>
            <div className="text-xs text-emerald-400 font-bold">al mes en piloto automático</div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-left text-xs">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Impacto Anual</span>
              <strong className="text-sm font-black text-slate-100 font-mono">
                +{recoveredRevenueAnnual.toLocaleString('es-ES')} €/año
              </strong>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Retorno (ROI)</span>
              <strong className="text-sm font-black text-zappi-emerald font-mono">
                {roiMultiplier}x sobre Zappi
              </strong>
            </div>
          </div>

          <Link
            href="/register"
            className="w-full bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            Recuperar mis carritos gratis ahora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}