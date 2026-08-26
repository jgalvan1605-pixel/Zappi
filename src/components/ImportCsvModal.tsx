'use client';

import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertTriangle, FileText, ArrowRight, RefreshCw, Tag } from 'lucide-react';
import { parseCsvText, ParsedCsvResult } from '@/lib/csvParser';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportCsvModal({ isOpen, onClose, onSuccess }: ImportCsvModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [parsedData, setParsedData] = useState<ParsedCsvResult | null>(null);
  const [fileName, setFileName] = useState('');
  
  // Mapeo de columnas
  const [phoneColumn, setPhoneColumn] = useState('');
  const [firstNameColumn, setFirstNameColumn] = useState('');
  const [lastNameColumn, setLastNameColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [tagsInput, setTagsInput] = useState('Importación CSV');
  const [defaultPrefix, setDefaultPrefix] = useState('34');

  const [loading, setLoading] = useState(false);
  const [importStats, setImportStats] = useState<{ totalSubmitted: number; validImported: number; invalidDiscarded: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvText(text);

      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setError('El archivo CSV está vacío o no tiene un formato válido.');
        return;
      }

      setParsedData(parsed);

      // Auto-detección inteligente de columnas
      const lowerHeaders = parsed.headers.map(h => ({ raw: h, lower: h.toLowerCase() }));
      
      const phoneMatch = lowerHeaders.find(h => h.lower.includes('tel') || h.lower.includes('phone') || h.lower.includes('movil') || h.lower.includes('whatsapp') || h.lower.includes('celular'));
      if (phoneMatch) setPhoneColumn(phoneMatch.raw);

      const firstMatch = lowerHeaders.find(h => h.lower === 'nombre' || h.lower === 'firstname' || h.lower === 'first_name' || h.lower.includes('name'));
      if (firstMatch) setFirstNameColumn(firstMatch.raw);

      const lastMatch = lowerHeaders.find(h => h.lower === 'apellidos' || h.lower === 'lastname' || h.lower === 'last_name' || h.lower.includes('apellido'));
      if (lastMatch) setLastNameColumn(lastMatch.raw);

      const emailMatch = lowerHeaders.find(h => h.lower.includes('email') || h.lower.includes('correo'));
      if (emailMatch) setEmailColumn(emailMatch.raw);

      setStep(2);
    };

    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!parsedData || !phoneColumn) {
      setError('Debes seleccionar al menos la columna del número de teléfono.');
      return;
    }

    setLoading(true);
    setError(null);

    const globalTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const formattedContacts = parsedData.rows.map(row => ({
      phone: row[phoneColumn] || '',
      firstName: firstNameColumn ? row[firstNameColumn] : undefined,
      lastName: lastNameColumn ? row[lastNameColumn] : undefined,
      email: emailColumn ? row[emailColumn] : undefined,
      customFields: row
    }));

    try {
      const res = await fetch('/api/contacts/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: formattedContacts,
          defaultPrefix,
          globalTags
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la importación');
      }

      setImportStats(data.stats);
      setStep(3);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setParsedData(null);
    setFileName('');
    setPhoneColumn('');
    setFirstNameColumn('');
    setLastNameColumn('');
    setEmailColumn('');
    setImportStats(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zappi-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-zappi-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zappi-emerald-light text-zappi-emerald flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zappi-midnight">Importación Masiva de Audiencias (CSV)</h3>
              <p className="text-xs text-slate-500">Normalizador automático a estándar E.164 (+34...)</p>
            </div>
          </div>
          <button onClick={() => { handleReset(); onClose(); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
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

          {/* PASO 1: SUBIR ARCHIVO */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-zappi-emerald rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-all text-center">
                <UploadCloud className="w-10 h-10 text-slate-400" />
                <div>
                  <span className="text-sm font-bold text-zappi-midnight">Haz clic para subir o arrastra tu archivo CSV</span>
                  <p className="text-xs text-slate-400 mt-1">Soporta exportaciones de Shopify, WooCommerce, Excel y CRMs</p>
                </div>
                <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* PASO 2: MAPEO DE COLUMNAS */}
          {step === 2 && parsedData && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-zappi-border text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zappi-emerald" />
                  <span className="font-bold text-zappi-midnight">{fileName}</span>
                </div>
                <span className="text-slate-500 font-semibold">{parsedData.totalRows} filas detectadas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zappi-midnight mb-1">
                    Columna de Teléfono <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={phoneColumn}
                    onChange={(e) => setPhoneColumn(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40"
                  >
                    <option value="">Selecciona la columna...</option>
                    {parsedData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zappi-midnight mb-1">
                    Prefijo por defecto (si no incluye +)
                  </label>
                  <select
                    value={defaultPrefix}
                    onChange={(e) => setDefaultPrefix(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40"
                  >
                    <option value="34">+34 (España)</option>
                    <option value="52">+52 (México)</option>
                    <option value="57">+57 (Colombia)</option>
                    <option value="54">+54 (Argentina)</option>
                    <option value="56">+56 (Chile)</option>
                    <option value="1">+1 (EE.UU. / Canadá)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zappi-midnight mb-1">Nombre (Opcional)</label>
                  <select
                    value={firstNameColumn}
                    onChange={(e) => setFirstNameColumn(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl font-medium text-slate-800"
                  >
                    <option value="">Ninguna</option>
                    {parsedData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zappi-midnight mb-1">Email (Opcional)</label>
                  <select
                    value={emailColumn}
                    onChange={(e) => setEmailColumn(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl font-medium text-slate-800"
                  >
                    <option value="">Ninguna</option>
                    {parsedData.headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zappi-midnight mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zappi-purple" />
                  Etiquetas a asignar a esta audiencia (separadas por comas)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="VIP, Clientes 2026, Black Friday"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white text-slate-900"
                />
              </div>

              {/* Previsualización de los primeros 2 registros */}
              <div className="border border-zappi-border rounded-xl p-3 bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Previsualización de Mapeo (Primeras filas):
                </span>
                <div className="space-y-1 text-xs">
                  {parsedData.rows.slice(0, 2).map((row, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200 flex items-center justify-between">
                      <span className="font-mono font-bold text-zappi-emerald">{row[phoneColumn] || 'Sin teléfono'}</span>
                      <span className="text-slate-600">{firstNameColumn ? row[firstNameColumn] : ''}</span>
                      <span className="text-slate-400">{emailColumn ? row[emailColumn] : ''}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={loading || !phoneColumn}
                  className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {loading ? 'Normalizando & Guardando...' : `Importar ${parsedData.totalRows} Contactos`}
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: RESUMEN DE ÉXITO */}
          {step === 3 && importStats && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-zappi-emerald rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-zappi-midnight">¡Importación Masiva Completada!</h4>
                <p className="text-xs text-slate-500 mt-1">Los contactos han sido normalizados y guardados en tu base de datos.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="bg-slate-50 p-3 rounded-xl border border-zappi-border">
                  <div className="text-lg font-black text-zappi-midnight">{importStats.totalSubmitted}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Procesados</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="text-lg font-black text-emerald-700">{importStats.validImported}</div>
                  <div className="text-[10px] text-emerald-600 uppercase font-bold">Válidos E.164</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-zappi-border">
                  <div className="text-lg font-black text-slate-400">{importStats.invalidDiscarded}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Descartados</div>
                </div>
              </div>

              <button
                onClick={() => { handleReset(); onClose(); }}
                className="bg-zappi-midnight hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
              >
                Cerrar y Ver Audiencias
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}