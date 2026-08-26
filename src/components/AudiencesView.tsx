'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UploadCloud, 
  Search, 
  Tag, 
  Trash2, 
  MessageSquare, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag,
  Plus
} from 'lucide-react';
import { ImportCsvModal } from './ImportCsvModal';

export function AudiencesView() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Formulario de contacto manual individual
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualTag, setManualTag] = useState('VIP');
  const [addLoading, setAddLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTag) params.append('tag', selectedTag);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();
      if (data.contacts) {
        setContacts(data.contacts);
        setTotalCount(data.pagination?.total || data.contacts.length);
        if (data.tags) setTags(data.tags);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este contacto?')) return;
    try {
      await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      fetchContacts();
    } catch {}
  };

  const handleCreateManualContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) return;

    setAddLoading(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: manualPhone.trim(),
          firstName: manualName.trim() || undefined,
          tags: manualTag ? [manualTag.trim()] : []
        })
      });

      if (res.ok) {
        setManualPhone('');
        setManualName('');
        setShowAddManual(false);
        fetchContacts();
      }
    } catch {} finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Estadísticas de Audiencia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Audiencia</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">{totalCount}</div>
          <div className="text-[11px] text-zappi-emerald font-semibold flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% E.164 Validados
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Segmentos Activos</span>
          <div className="text-2xl font-black text-zappi-purple mt-1">{tags.length}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Etiquetas organizadas</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Con Mensajes Cruzados</span>
          <div className="text-2xl font-black text-zappi-midnight mt-1">
            {contacts.filter(c => c._count?.messages > 0).length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Historial en Inbox</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zappi-border shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Canales Conectados</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">WhatsApp</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Meta Cloud API Activo</div>
        </div>
      </div>

      {/* Barra de Acciones y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-zappi-border shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Buscar por teléfono, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {tags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-zappi-border rounded-xl text-slate-700 font-medium"
            >
              <option value="">🏷️ Todas las Etiquetas ({tags.length})</option>
              {tags.map(t => (
                <option key={t.name} value={t.name}>{t.name} ({t.count})</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddManual(!showAddManual)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-zappi-midnight text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir Uno
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            Importar CSV Masivo
          </button>
        </div>
      </div>

      {/* Formulario de Alta Manual Rápida */}
      {showAddManual && (
        <form onSubmit={handleCreateManualContact} className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="+34600000000"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            required
            className="px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-mono text-slate-900 flex-1 min-w-[160px]"
          />
          <input
            type="text"
            placeholder="Nombre (ej: Carlos)"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl text-slate-900 flex-1 min-w-[140px]"
          />
          <input
            type="text"
            placeholder="Etiqueta (ej: VIP)"
            value={manualTag}
            onChange={(e) => setManualTag(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl text-slate-900 w-32"
          />
          <button
            type="submit"
            disabled={addLoading}
            className="bg-zappi-emerald text-zappi-midnight font-bold text-xs px-4 py-2 rounded-xl hover:bg-zappi-emerald-hover transition-all"
          >
            {addLoading ? 'Guardando...' : 'Guardar Contacto'}
          </button>
        </form>
      )}

      {/* Tabla de Contactos */}
      <div className="bg-white rounded-xl border border-zappi-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Cargando audiencia...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zappi-midnight">No hay contactos en esta vista</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Importa tu primera lista mediante archivo CSV para comenzar a lanzar campañas interactivas por WhatsApp.
            </p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-zappi-emerald text-zappi-midnight font-bold text-xs px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" /> Subir CSV
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-zappi-border text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Teléfono (E.164)</th>
                  <th className="py-3 px-4">Nombre / Contacto</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Segmentos & Tags</th>
                  <th className="py-3 px-4">Mensajes</th>
                  <th className="py-3 px-4">Alta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-zappi-midnight flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-zappi-emerald"></span>
                        {contact.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {contact.firstName ? `${contact.firstName} ${contact.lastName || ''}`.trim() : <span className="text-slate-400 font-normal">Sin nombre</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {contact.email || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((t: string) => (
                            <span key={t} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">Sin tags</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        {contact._count?.messages || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(contact.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar Contacto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Importación CSV */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          fetchContacts();
        }}
      />
    </div>
  );
}