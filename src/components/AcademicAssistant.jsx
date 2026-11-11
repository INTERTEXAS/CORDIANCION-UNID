import React, { useEffect, useRef, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Loader2, Send, Sparkles, X, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const suggestedQuestions = [
  '¿Qué hay en la base de datos?',
  'Busca alumnos',
  '¿Qué carreras tienen auditorías guardadas?'
];

export default function AcademicAssistant({ onClose, onOpenStudentAudit, onOpenBatchAudit }) {
  const { instance, accounts } = useMsal();
  const { isSuperAdmin, devAssistantToken } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hola. Puedo consultar la base de datos de auditorías: buscar alumnos por nombre o matrícula, revisar su resumen académico y mostrar qué carreras y ciclos tienen registros guardados.'
  }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const allowLocalBypass = import.meta.env.DEV || import.meta.env.VITE_LOCAL_AUTH_BYPASS === 'true';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const sendMessage = async (value) => {
    const question = value.trim();
    if (!question || isSending || question.length > 1000) return;

    const previousMessages = messages;
    setMessages((current) => [...current, { role: 'user', content: question }]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      let authorizationHeader;
      if (isSuperAdmin) {
        if (devAssistantToken) {
          authorizationHeader = `Dev ${devAssistantToken}`;
        }
      } else if (!allowLocalBypass) {
        const account = instance.getActiveAccount() || accounts[0];
        if (!account) {
          throw new Error('Inicia sesión con tu cuenta institucional para usar el asistente.');
        }
        const tokenResult = await instance.acquireTokenSilent({
          scopes: ['User.Read'],
          account
        });
        authorizationHeader = `Bearer ${tokenResult.accessToken}`;
      }

      const response = await fetch('/api/academic-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authorizationHeader ? { Authorization: authorizationHeader } : {})
        },
        body: JSON.stringify({
          question,
          history: previousMessages.slice(-8)
        })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'No se pudo obtener una respuesta del asistente.');
      }

      // Si el servidor detectó la orden de abrir el kárdex individual en pantalla
      if (result.action === 'LOAD_STUDENT_AUDIT' && result.studentData && onOpenStudentAudit) {
        onOpenStudentAudit(result.studentData);
        onClose();
        return;
      }

      // Si el servidor detectó la orden de abrir la auditoría de grupo en pantalla
      if (result.action === 'LOAD_BATCH_AUDIT' && result.batchData && onOpenBatchAudit) {
        onOpenBatchAudit(result.batchData);
        onClose();
        return;
      }

      setMessages((current) => [
        ...current, 
        { 
          role: 'assistant', 
          content: result.reply,
          studentAuditSummary: result.studentAuditSummary || null,
          groupSummary: result.groupSummary || null
        }
      ]);
    } catch (requestError) {
      console.error('[AcademicAssistant] Error al consultar el asistente:', requestError);
      setError(requestError.message || 'No se pudo conectar con el asistente. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const copyToClipboard = (text, idx) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
      });
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar asistente académico"
        className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="academic-assistant-title"
        className="fixed bottom-4 right-4 z-50 flex h-[min(680px,calc(100vh-2rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-border bg-surface-1 text-text-primary shadow-2xl animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F2B705]/15 border border-[#F2B705]/30 text-[#F2B705] shadow-sm">
              <Sparkles className="h-5 w-5 text-[#F2B705]" />
            </div>
            <div className="min-w-0">
              <h2 id="academic-assistant-title" className="truncate text-sm font-bold text-text-primary">
                Asistente Académico UNID
              </h2>
              <p className="truncate text-[11px] text-text-muted">
                Control y Auditoría Escolar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
            aria-label="Cerrar chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          <div className="rounded-2xl bg-surface-2 px-3.5 py-3 text-[11px] leading-relaxed text-text-secondary">
            Las búsquedas de alumnos consultan directamente la base institucional; esos resultados no se envían a Gemini. Comparte solo la información necesaria y confirma los dictámenes con el personal autorizado.
          </div>

          {messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            
            // Detectar si el mensaje contiene lista de alumnos con formato "• Nombre (matricula)"
            const studentMatches = isAssistant ? [...message.content.matchAll(/•\s*([^(]+?)\s*\((\d{5,12})\)/g)] : [];
            
            // Detectar si el mensaje es una pregunta de opciones académicas ("¿Qué información necesitas consultar?")
            const hasOptionsPrompt = isAssistant && message.content.includes('¿Qué información necesitas consultar?');
            
            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5 group/msg`}
              >
                <div className={`relative max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed select-text ${
                  message.role === 'user'
                    ? 'rounded-br-md bg-[#F2B705] text-slate-950 font-medium shadow-xs'
                    : 'rounded-bl-md bg-surface-2 text-text-primary'
                }`}>
                  {message.content}
                  {/* Botón flotante para copiar texto */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(message.content, index)}
                    title={copiedIdx === index ? 'Copiado al portapapeles' : 'Copiar texto'}
                    className={`absolute bottom-1.5 right-1.5 p-1 rounded-lg opacity-0 group-hover/msg:opacity-100 transition-opacity ${
                      message.role === 'user' 
                        ? 'bg-black/20 text-white hover:bg-black/40' 
                        : 'bg-surface-3/80 text-text-muted hover:text-text-primary hover:bg-surface-3'
                    }`}
                  >
                    {copiedIdx === index ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Tarjeta de acción ejecutiva para grupos (evita saturar el chat con 30 botones) */}
                {message.groupSummary && (
                  <div className="mt-1.5 w-full max-w-[95%] rounded-2xl border border-border bg-surface-2 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-primary">
                        Auditoría grupal: {message.groupSummary.carreraCodigo}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {message.groupSummary.total} expedientes
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendMessage(`Abre el grupo de ${message.groupSummary.carreraCodigo}`)}
                      disabled={isSending}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-slate-950 shadow-xs hover:bg-accent-hover transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <span>Cargar los {message.groupSummary.total} alumnos en pantalla completa</span>
                    </button>

                    {message.groupSummary.alumnos?.length > 0 && (
                      <div className="pt-1">
                        <select
                          defaultValue=""
                          disabled={isSending}
                          aria-label="Seleccionar alumno del grupo para consultar"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              sendMessage(`Revisa la información completa de ${val}`);
                              e.target.value = '';
                            }
                          }}
                          className="w-full rounded-xl border border-border bg-surface-1 px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent cursor-pointer"
                        >
                          <option value="" disabled>Consultar alumno individual del grupo...</option>
                          {message.groupSummary.alumnos.map((a) => (
                            <option key={a.matricula} value={a.matricula}>
                              {a.nombre || 'Alumno'} ({a.matricula})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Acciones para búsquedas individuales de alumnos (máximo 3 botones o selector compacto) */}
                {!message.groupSummary && studentMatches.length > 0 && studentMatches.length <= 3 && (
                  <div className="flex flex-wrap gap-1.5 max-w-[95%] pt-1">
                    {studentMatches.map((match, mIdx) => {
                      const nombre = match[1].trim();
                      const mat = match[2];
                      const primerNombre = nombre.split(' ')[0] || nombre;
                      return (
                        <div key={`${mat}-${mIdx}`} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => sendMessage(`Revisa la información completa de ${mat}`)}
                            disabled={isSending}
                            className="inline-flex items-center gap-1 rounded-xl border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                          >
                            <span>Consultar {primerNombre} ({mat})</span>
                          </button>
                          {onOpenStudentAudit && (
                            <button
                              type="button"
                              onClick={() => sendMessage(`Abre el kardex de ${mat}`)}
                              disabled={isSending}
                              title="Abrir expediente completo en la pantalla de auditoría"
                              className="inline-flex items-center rounded-xl border border-border bg-surface-2 px-2 py-1 text-[11px] font-semibold text-text-primary hover:border-accent hover:text-accent transition-all disabled:opacity-50"
                            >
                              <span>Ver kárdex</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!message.groupSummary && studentMatches.length > 3 && (
                  <div className="w-full max-w-[95%] pt-1">
                    <select
                      defaultValue=""
                      disabled={isSending}
                      aria-label="Seleccionar alumno encontrado"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          sendMessage(`Revisa la información completa de ${val}`);
                          e.target.value = '';
                        }
                      }}
                      className="w-full rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="" disabled>Selecciona un alumno para consultar...</option>
                      {studentMatches.map((match) => {
                        const nombre = match[1].trim();
                        const mat = match[2];
                        return (
                          <option key={mat} value={mat}>
                            {nombre} ({mat})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Si el mensaje incluye el resumen de un estudiante, ofrecer botón de apertura directa */}
                {message.studentAuditSummary && onOpenStudentAudit && (
                  <div className="pt-1 max-w-[95%]">
                    <button
                      type="button"
                      onClick={() => {
                        const summary = message.studentAuditSummary;
                        onOpenStudentAudit({
                          estudiante: {
                            matricula: summary.matricula,
                            nombre: summary.nombre,
                            programa: summary.carreraCodigo
                          },
                          auditData: summary.auditData,
                          carreraCodigo: summary.carreraCodigo
                        });
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-accent-hover transition-all"
                    >
                      <span>Abrir kárdex interactivo en pantalla</span>
                    </button>
                  </div>
                )}

                {/* Botones para responder automáticamente a la pregunta de opciones (sin emojis) */}
                {hasOptionsPrompt && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-w-[95%] pt-1 w-full">
                    <button
                      type="button"
                      onClick={() => sendMessage('Resumen general')}
                      disabled={isSending}
                      className="text-left rounded-xl border border-border bg-surface-2 hover:bg-accent/15 hover:border-accent/40 px-2.5 py-1.5 text-[11px] font-medium text-text-primary transition-all disabled:opacity-50"
                    >
                      Resumen general
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage('Adeudos y pendientes')}
                      disabled={isSending}
                      className="text-left rounded-xl border border-border bg-surface-2 hover:bg-accent/15 hover:border-accent/40 px-2.5 py-1.5 text-[11px] font-medium text-text-primary transition-all disabled:opacity-50"
                    >
                      Adeudos y materias pendientes
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage('Materias aprobadas')}
                      disabled={isSending}
                      className="text-left rounded-xl border border-border bg-surface-2 hover:bg-accent/15 hover:border-accent/40 px-2.5 py-1.5 text-[11px] font-medium text-text-primary transition-all disabled:opacity-50"
                    >
                      Materias aprobadas
                    </button>
                    <button
                      type="button"
                      onClick={() => sendMessage('Estatus y elegibilidad para estadia')}
                      disabled={isSending}
                      className="text-left rounded-xl border border-border bg-surface-2 hover:bg-accent/15 hover:border-accent/40 px-2.5 py-1.5 text-[11px] font-medium text-text-primary transition-all disabled:opacity-50"
                    >
                      Estatus y elegibilidad de estadía
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Revisando información…
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </div>
          )}
          {messages.length === 1 && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Prueba con</p>
              {suggestedQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() => sendMessage(question)}
                  disabled={isSending}
                  className="block w-full rounded-xl border border-border px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:border-accent/40 hover:bg-surface-2 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface-2 p-2 focus-within:border-accent/50">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 1000))}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              maxLength={1000}
              rows={1}
              placeholder="Pregunta sobre el sistema o una matrícula…"
              aria-label="Escribe tu pregunta"
              className="max-h-28 min-h-9 flex-1 resize-y bg-transparent px-2 py-2 text-[13px] text-text-primary outline-none placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F2B705] hover:bg-[#d9a404] text-slate-950 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-text-muted">
            Verifica siempre los dictámenes con los criterios institucionales.
          </p>
        </form>
      </section>
    </>
  );
}
