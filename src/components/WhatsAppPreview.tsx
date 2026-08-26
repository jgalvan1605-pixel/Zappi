'use client';

import React from 'react';
import { CheckCheck, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { MetaTemplateItem } from '@/lib/metaTemplates';

interface WhatsAppPreviewProps {
  template?: MetaTemplateItem | null;
  variables?: Record<string, string>;
  sampleContactName?: string;
}

export function WhatsAppPreview({ template, variables = {}, sampleContactName = 'Carlos' }: WhatsAppPreviewProps) {
  if (!template) {
    return (
      <div className="w-[300px] h-[520px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
        <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-zappi-emerald" />
        Selecciona una plantilla para ver la simulación en vivo
      </div>
    );
  }

  // Extraer componentes
  const headerComp = template.components?.find(c => c.type === 'HEADER');
  const bodyComp = template.components?.find(c => c.type === 'BODY');
  const footerComp = template.components?.find(c => c.type === 'FOOTER');
  const buttonsComp = template.components?.find(c => c.type === 'BUTTONS');

  // Reemplazar variables {{1}}, {{2}} en el cuerpo
  let resolvedBody = bodyComp?.text || '';
  resolvedBody = resolvedBody
    .replace(/\{\{1\}\}/g, variables['{{1}}'] || sampleContactName)
    .replace(/\{\{2\}\}/g, variables['{{2}}'] || '15% de descuento')
    .replace(/\{\{3\}\}/g, variables['{{3}}'] || 'ZAPPI15');

  let resolvedHeader = headerComp?.text || '';
  resolvedHeader = resolvedHeader
    .replace(/\{\{1\}\}/g, variables['{{1}}'] || sampleContactName);

  return (
    <div className="w-[310px] h-[540px] bg-slate-950 rounded-[40px] p-2.5 shadow-2xl border-[5px] border-slate-800 flex flex-col justify-between shrink-0 select-none">
      
      {/* Notch & Barra de Estado Móvil */}
      <div className="pt-2 px-6 flex justify-between items-center text-[10px] text-slate-400">
        <span>09:41</span>
        <div className="w-16 h-3.5 bg-black rounded-full"></div>
        <span className="font-bold">5G</span>
      </div>

      {/* Header de WhatsApp */}
      <div className="bg-[#075E54] text-white px-3 py-2 rounded-t-2xl flex items-center gap-2.5 shadow-sm mt-1">
        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs shadow-inner">
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold flex items-center gap-1 truncate">
            Mi Tienda Oficial
            <ShieldCheck className="w-3 h-3 text-emerald-300 shrink-0" />
          </div>
          <div className="text-[9px] text-emerald-200">Cuenta de empresa oficial</div>
        </div>
      </div>

      {/* Pantalla del Chat con Fondo WhatsApp */}
      <div className="flex-1 bg-[#E5DDD5] dark:bg-[#0b141a] p-3 overflow-y-auto flex flex-col justify-end space-y-2">
        <div className="text-[9px] bg-white/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-md mx-auto font-medium shadow-xs">
          HOY
        </div>

        {/* Bocadillo Verde de WhatsApp */}
        <div className="bg-[#E7FFDB] dark:bg-[#005c4b] text-slate-900 dark:text-white p-3 rounded-2xl rounded-tr-none shadow-md max-w-[92%] ml-auto text-xs space-y-2 border border-emerald-200/50 dark:border-none">
          
          {/* Header del Mensaje */}
          {headerComp && (
            <div className="font-black text-xs text-[#075E54] dark:text-emerald-300">
              {resolvedHeader}
            </div>
          )}

          {/* Cuerpo del Mensaje */}
          <div className="leading-relaxed whitespace-pre-wrap text-[11.5px]">
            {resolvedBody}
          </div>

          {/* Footer del Mensaje */}
          {footerComp && (
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 border-t border-emerald-200/40 pt-1">
              {footerComp.text}
            </div>
          )}

          {/* Timestamp y Doble Check Azul */}
          <div className="flex items-center justify-end gap-1 text-[8.5px] text-slate-500 dark:text-emerald-200 pt-0.5">
            <span>09:41</span>
            <CheckCheck className="w-3 h-3 text-sky-500" />
          </div>
        </div>

        {/* Botones Interactivos CTA / Quick Replies */}
        {buttonsComp?.buttons && buttonsComp.buttons.length > 0 && (
          <div className="space-y-1 max-w-[92%] ml-auto">
            {buttonsComp.buttons.map((btn, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#202c33] text-[#00A884] dark:text-[#00a884] font-bold text-[11px] py-1.5 px-3 rounded-xl text-center shadow-sm flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                {btn.type === 'URL' && <ExternalLink className="w-3 h-3" />}
                {btn.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra Inferior del Móvil */}
      <div className="pb-1 text-center">
        <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto"></div>
      </div>

    </div>
  );
}