'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  CheckCheck, 
  Clock, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  Tag, 
  ShoppingBag, 
  Sparkles, 
  RefreshCw,
  MoreVertical,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { DEFAULT_SNIPPETS, QuickSnippet } from '@/lib/quickSnippets';

export function InboxView() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [counts, setCounts] = useState({ open: 0, pending: 0, closed: 0, total: 0 });
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'pending' | 'closed' | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingList, setLoadingList] = useState(true);

  // Conversación Activa
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);

  // Menú de Snippets Rápidos (Trigger con '/')
  const [showSnippets, setShowSnippets] = useState(false);
  const [filteredSnippets, setFilteredSnippets] = useState<QuickSnippet[]>(DEFAULT_SNIPPETS);
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchConversations = async (autoSelectFirst = false) => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/conversations?${params.toString()}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (data.counts) setCounts(data.counts);

        if (autoSelectFirst && data.conversations.length > 0 && !activeConv) {
          setActiveConv(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Carga inicial y polling en tiempo real cada 4 segundos
  useEffect(() => {
    fetchConversations(true);
    const interval = setInterval(() => {
      fetchConversations(false);
      if (activeConv) {
        fetchMessages(activeConv.id);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedStatus, searchTerm]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manejo de Snippets con '/'
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageInput(val);

    if (val.startsWith('/')) {
      const query = val.toLowerCase();
      const filtered = DEFAULT_SNIPPETS.filter(s => 
        s.shortcut.toLowerCase().includes(query) || 
        s.title.toLowerCase().includes(query)
      );
      setFilteredSnippets(filtered);
      setShowSnippets(filtered.length > 0);
      setSelectedSnippetIdx(0);
    } else {
      setShowSnippets(false);
    }
  };

  const applySnippet = (snippet: QuickSnippet) => {
    setMessageInput(snippet.text);
    setShowSnippets(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConv || sending) return;

    const textToSend = messageInput.trim();
    setMessageInput('');
    setShowSnippets(false);
    setSending(true);

    // Optimistic UI update
    const tempMsg = {
      id: `temp_${Date.now()}`,
      direction: 'outbound',
      type: 'text',
      text: textToSend,
      status: 'sent',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`/api/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Error al enviar: ${data.error}`);
      } else {
        fetchMessages(activeConv.id);
        fetchConversations(false);
      }
    } catch (err: any) {
      alert(`Error de red: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus: 'open' | 'pending' | 'closed') => {
    if (!activeConv) return;
    try {
      await fetch('/api/conversations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeConv.id, status: newStatus })
      });
      setActiveConv({ ...activeConv, status: newStatus });
      fetchConversations(false);
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl border border-zappi-border shadow-md h-[calc(100vh-130px)] flex overflow-hidden">
      
      {/* ========================================================================= */}
      {/* COLUMNA 1: LISTA DE CHATS */}
      {/* ========================================================================= */}
      <div className="w-80 border-r border-zappi-border flex flex-col bg-slate-50/60 shrink-0">
        
        {/* Header con Filtros de Estado */}
        <div className="p-3.5 border-b border-zappi-border space-y-2.5 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-zappi-midnight flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-zappi-emerald" />
              Inbox de WhatsApp
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
              {counts.open} Abiertos
            </span>
          </div>

          {/* Selector de Filtros */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setSelectedStatus('open')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedStatus === 'open' ? 'bg-white text-zappi-midnight shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Abiertos ({counts.open})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedStatus === 'pending' ? 'bg-white text-zappi-midnight shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pendientes ({counts.pending})
            </button>
            <button
              onClick={() => setSelectedStatus('closed')}
              className={`flex-1 py-1 rounded-lg transition-all ${
                selectedStatus === 'closed' ? 'bg-white text-zappi-midnight shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cerrados ({counts.closed})
            </button>
          </div>

          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por teléfono o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>

        {/* Lista de Conversaciones */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p className="font-bold text-slate-600">No hay conversaciones</p>
              <p className="text-[11px]">Los mensajes entrantes de clientes aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-all ${
                    isSelected ? 'bg-emerald-50/80 border-l-4 border-zappi-emerald' : 'hover:bg-white'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                    {conv.contactName?.slice(0, 2).toUpperCase() || 'WA'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-zappi-midnight truncate">
                        {conv.contactName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {conv.contactPhone}
                    </div>

                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Nueva conversación iniciada'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* COLUMNA 2: SALA DE CHAT EN VIVO */}
      {/* ========================================================================= */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-[#F0F2F5] dark:bg-slate-900 overflow-hidden">
          
          {/* Header del Chat */}
          <div className="h-16 bg-white dark:bg-slate-800 border-b border-zappi-border px-5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zappi-emerald text-zappi-midnight font-extrabold flex items-center justify-center text-xs shadow-sm">
                {activeConv.contactName?.slice(0, 2).toUpperCase() || 'WA'}
              </div>
              <div>
                <div className="text-xs font-extrabold text-zappi-midnight dark:text-white flex items-center gap-2">
                  {activeConv.contactName}
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    activeConv.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                    activeConv.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {activeConv.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {activeConv.contactPhone}
                </div>
              </div>
            </div>

            {/* Acciones de Estado */}
            <div className="flex items-center gap-2">
              {activeConv.status !== 'closed' ? (
                <button
                  onClick={() => updateStatus('closed')}
                  className="bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-zappi-emerald" />
                  Resolver Chat
                </button>
              ) : (
                <button
                  onClick={() => updateStatus('open')}
                  className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-200 transition-all"
                >
                  Reabrir Ticket
                </button>
              )}
            </div>
          </div>

          {/* Hilo de Mensajes con Fondo WhatsApp */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {loadingMessages ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Cargando historial...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No hay mensajes aún en esta conversación.
              </div>
            ) : (
              messages.map((msg) => {
                const isOutbound = msg.direction === 'outbound';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm space-y-1 ${
                        isOutbound
                          ? 'bg-[#D9FDD3] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none border border-emerald-200/50'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-[12px]">{msg.text}</div>
                      
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 pt-0.5">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOutbound && (
                          <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-500' : 'text-slate-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Menú Flotante de Snippets Rápidos (Trigger con '/') */}
          {showSnippets && (
            <div className="bg-white dark:bg-slate-800 border-t border-zappi-border p-2 shadow-xl max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                ⚡ Respuestas Rápidas (Haz clic para autocompletar):
              </span>
              <div className="space-y-1">
                {filteredSnippets.map((snippet) => (
                  <button
                    key={snippet.shortcut}
                    onClick={() => applySnippet(snippet)}
                    className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-zappi-emerald">{snippet.shortcut}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{snippet.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{snippet.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer de Mensajes */}
          <form onSubmit={handleSendMessage} className="p-3.5 bg-white dark:bg-slate-800 border-t border-zappi-border flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Escribe un mensaje o usa '/' para respuestas rápidas..."
              value={messageInput}
              onChange={handleInputChange}
              className="flex-1 px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-zappi-border rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-zappi-emerald/40 text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="bg-zappi-emerald hover:bg-zappi-emerald-hover text-zappi-midnight p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 text-slate-400">
          <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-600">Selecciona una conversación</h4>
          <p className="text-xs max-w-xs mt-1">Elige un chat de la lista izquierda para ver el historial y responder en directo.</p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLUMNA 3: FICHA CONTEXTUAL 360° DEL CLIENTE */}
      {/* ========================================================================= */}
      {activeConv && (
        <div className="w-72 border-l border-zappi-border p-5 bg-white overflow-y-auto space-y-5 shrink-0">
          
          {/* Perfil */}
          <div className="text-center space-y-1.5 pb-4 border-b border-zappi-border">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-emerald-400 text-zappi-midnight font-black flex items-center justify-center text-lg mx-auto shadow-sm">
              {activeConv.contactName?.slice(0, 2).toUpperCase() || 'WA'}
            </div>
            <h4 className="text-sm font-extrabold text-zappi-midnight">{activeConv.contactName}</h4>
            <div className="text-xs font-mono text-emerald-700 bg-emerald-50 py-0.5 px-2.5 rounded-full inline-block font-bold">
              {activeConv.contactPhone}
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Detalles del Cliente
            </span>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{activeConv.contact?.email || 'Sin email registrado'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Cliente desde: {new Date(activeConv.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          {/* Métricas de Shopify / E-Commerce */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-zappi-border space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-zappi-purple" />
              Actividad Shopify
            </span>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-xs font-black text-zappi-midnight">
                  {activeConv.contact?.customFields?.orders_count || 1}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Pedidos</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-xs font-black text-emerald-700">
                  {activeConv.contact?.customFields?.total_spent ? `${activeConv.contact.customFields.total_spent} €` : '450 €'}
                </div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">Gasto Total</div>
              </div>
            </div>
          </div>

          {/* Segmentos y Etiquetas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Etiquetas del Contacto
            </span>
            <div className="flex gap-1 flex-wrap">
              {activeConv.contact?.tags && activeConv.contact.tags.length > 0 ? (
                activeConv.contact.tags.map((t: string) => (
                  <span key={t} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">Sin etiquetas</span>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}