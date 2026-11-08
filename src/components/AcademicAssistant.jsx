import React, { useEffect, useRef, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const suggestedQuestions = [
  '¿Qué hay en la base de datos?',
  'Busca alumnos',
  '¿Qué carreras tienen auditorías guardadas?'
];

export default function AcademicAssistant({ onClose }) {
  const { instance, accounts } = useMsal();
  const { isSuperAdmin, devAssistantToken } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hola. Puedo consultar la base de datos de auditorías: buscar alumnos por nombre o matrícula, revisar su resumen académico y mostrar qué carreras y ciclos tienen registros guardados.'
  }]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const allowLocalBypass = import.meta.env.DEV && import.meta.env.VITE_LOCAL_AUTH_BYPASS === 'true';

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
        } else if (!allowLocalBypass) {
          throw new Error('Vuelve a iniciar sesión como administrador para habilitar el asistente.');
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
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }]);
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-rose-400 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="academic-assistant-title" className="truncate text-sm font-bold">
                Asistente académico
              </h2>
              <p className="truncate text-[11px] text-text-muted">
                Todas las carreras · Gemini Flash
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
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                message.role === 'user'
                  ? 'rounded-br-md bg-accent text-white'
                  : 'rounded-bl-md bg-surface-2 text-text-primary'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
