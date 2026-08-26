'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Send, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  Lock, 
  Smartphone,
  ChevronRight,
  Check
} from 'lucide-react';
import { RoiCalculator } from './RoiCalculator';
import { WhatsAppPreview } from './WhatsAppPreview';
import { PREBUILT_TEMPLATES } from '@/lib/metaTemplates';
import { ZAPPI_PLANS } from '@/lib/stripe';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zappi-surface text-zappi-midnight selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Header / Navbar de Navegación */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-zappi-border">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zappi-emerald flex items-center justify-center font-black text-xl text-zappi-midnight shadow-md shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-zappi-midnight flex items-center gap-1.5">
                Zappi <span className="text-[10px] bg-zappi-purple text-white px-2 py-0.5 rounded-full font-bold">SAAS</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">El Mailchimp de WhatsApp</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#solucion" className="hover:text-zappi-midnight transition-all">Solución</a>
            <a href="#roi" className="hover:text-zappi-midnight transition-all">Calculadora ROI</a>
            <a href="#precios" className="hover:text-zappi-midnight transition-all">Planes</a>
            <a href="#faq" className="hover:text-zappi-midnight transition-all">Preguntas Frecuentes</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-zappi-midnight px-3 py-2 rounded-xl transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              Probar 250 Envíos Gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Principal con Simulación Móvil en Vivo */}
      <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-300/60 text-emerald-900 text-xs font-extrabold px-3 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-zappi-emerald animate-pulse"></span>
              Conexión Oficial Meta Cloud API en 60 Segundos
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-zappi-midnight leading-[1.1] tracking-tight">
              El marketing que tus clientes <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 underline decoration-zappi-emerald/40">sí abren.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Deja de perder ventas en la bandeja de spam. Automatiza la recuperación de carritos abandonados de Shopify y lanza campañas interactivas por WhatsApp con un <strong>98% de apertura</strong> y sin tocar una línea de código.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/register"
                className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Empezar Gratis Ahora (Sin Tarjeta)
              </Link>
              <a
                href="#roi"
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-5 py-3.5 rounded-xl border border-zappi-border transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                Calcular mis Ventas Recuperables
              </a>
            </div>

            {/* Badges de Confianza */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="text-xl font-black text-zappi-midnight font-mono">98%</div>
                <div className="text-[11px] text-slate-500">Tasa de Apertura</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl font-black text-zappi-purple font-mono">20 min</div>
                <div className="text-[11px] text-slate-500">Delay Óptimo Carrito</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl font-black text-emerald-600 font-mono">11.8x</div>
                <div className="text-[11px] text-slate-500">ROI Promedio</div>
              </div>
            </div>
          </div>

          {/* Simulador Móvil de WhatsApp en Vivo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <WhatsAppPreview
              template={PREBUILT_TEMPLATES[0]}
              sampleContactName="Javier"
              variables={{ '{{1}}': 'Javier', '{{2}}': '15% de descuento', '{{3}}': 'ZAPPI15' }}
            />
          </div>

        </div>
      </section>

      {/* 3. Comparativa: Email Marketing vs WhatsApp de Zappi */}
      <section id="solucion" className="py-16 bg-white border-y border-zappi-border">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-zappi-purple uppercase tracking-wider">¿Por qué WhatsApp?</span>
            <h2 className="text-3xl font-black text-zappi-midnight">El Email Marketing ha muerto para las compras urgentes</h2>
            <p className="text-xs text-slate-500">Compara los números de la mensajería instantánea frente a las bandejas de correo saturadas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Email Tradicional */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-5 opacity-80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-400">Email Tradicional (Mailchimp / Klaviyo)</span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Baja Conversión</span>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Tasa de Apertura Media:</span>
                  <strong className="text-slate-800 font-mono">~18% - 22%</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Tiempo promedio en abrirse:</span>
                  <strong className="text-slate-800 font-mono">6 a 24 horas</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Llega a pestaña Promociones/Spam:</span>
                  <strong className="text-red-600 font-mono">Sí (frecuente)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Interacción interactiva con 1 clic:</span>
                  <strong className="text-slate-400">No soportado</strong>
                </div>
              </div>
            </div>

            {/* WhatsApp con Zappi */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-8 rounded-3xl border-2 border-zappi-emerald shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-zappi-emerald" />
                  Marketing por WhatsApp con Zappi
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                  Alta Conversión ⭐
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex justify-between border-b border-emerald-200 pb-2">
                  <span>Tasa de Apertura Real:</span>
                  <strong className="text-emerald-800 font-black font-mono text-sm">96.8% - 98.4%</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-200 pb-2">
                  <span>Tiempo promedio en abrirse:</span>
                  <strong className="text-emerald-800 font-bold font-mono">Menos de 3 minutos</strong>
                </div>
                <div className="flex justify-between border-b border-emerald-200 pb-2">
                  <span>Llega directo a pantalla de bloqueo:</span>
                  <strong className="text-emerald-800 font-bold">100% Notificación Push</strong>
                </div>
                <div className="flex justify-between">
                  <span>Botones de Compra y Chat en Vivo:</span>
                  <strong className="text-emerald-800 font-bold">Integrados en el mensaje</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección Calculadora de ROI Interactiva */}
      <section id="roi" className="py-20 px-6 max-w-6xl mx-auto">
        <RoiCalculator />
      </section>

      {/* 5. Tabla de Precios SaaS */}
      <section id="precios" className="py-20 bg-white border-t border-zappi-border">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-zappi-emerald uppercase tracking-wider">Precios Transparentes</span>
            <h2 className="text-3xl font-black text-zappi-midnight">Comienza gratis y escala con tus ventas</h2>
            <p className="text-xs text-slate-500">Sin contratos de permanencia. Cancela o cambia de plan en cualquier momento.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {Object.values(ZAPPI_PLANS).map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all relative ${
                  plan.isPopular 
                    ? 'border-zappi-purple shadow-2xl ring-2 ring-zappi-purple/20' 
                    : 'border-zappi-border shadow-sm hover:border-slate-300'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-zappi-purple text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-md">
                    ⭐ Opción Más Elegida
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-black text-zappi-midnight">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zappi-midnight">{plan.priceMonthly} €</span>
                    <span className="text-xs text-slate-400 font-semibold">/ mes</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Incluido en este plan:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                        <Check className="w-4 h-4 text-zappi-emerald shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    href="/register"
                    className={`w-full py-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight shadow-md'
                        : 'bg-zappi-midnight hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.priceMonthly === 0 ? 'Probar 250 Mensajes Gratis' : `Comenzar con ${plan.name}`}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Preguntas Frecuentes (FAQ) */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">FAQ</span>
          <h2 className="text-2xl font-black text-zappi-midnight">Preguntas Frecuentes</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-zappi-border space-y-1.5">
            <h4 className="font-bold text-zappi-midnight text-sm">¿Puedo conectar mi propio número de WhatsApp Business actual?</h4>
            <p className="text-slate-600 leading-relaxed">
              Sí. Mediante el conector oficial de Meta Cloud API puedes vincular tu número actual en menos de 60 segundos manteniendo tu nombre y foto de perfil verificado.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zappi-border space-y-1.5">
            <h4 className="font-bold text-zappi-midnight text-sm">¿Cómo se conecta con mi tienda Shopify?</h4>
            <p className="text-slate-600 leading-relaxed">
              Solo debes pegar la URL de Webhook de Zappi en los ajustes de notificaciones de tu Shopify. Tardas 2 minutos y no necesitas instalar código ni editar temas Liquid.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zappi-border space-y-1.5">
            <h4 className="font-bold text-zappi-midnight text-sm">¿Cumple con el RGPD y la normativa europea?</h4>
            <p className="text-slate-600 leading-relaxed">
              100%. Zappi incluye un gestor automatizado de desuscripción: si un cliente responde "BAJA" o "STOP", el sistema lo da de baja automáticamente y cancela cualquier mensaje futuro.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-zappi-midnight text-white py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-bold text-white text-sm">Zappi</span>
            <span>• Plataforma de Marketing Conversacional para WhatsApp</span>
          </div>

          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white">Acceso a Clientes</Link>
            <Link href="/register" className="hover:text-white">Registro</Link>
          </div>

          <div>
            © {new Date().getFullYear()} Zappi SaaS. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}