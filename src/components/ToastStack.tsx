import { useEffect, useState } from 'react';
import type { ToastItem, ToastTone } from '../hooks/useToasts';

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-primary-4 bg-white',
  error: 'border-red-3 bg-white',
  info: 'border-blue-3 bg-white',
};

const DOT_STYLES: Record<ToastTone, string> = {
  success: 'bg-primary-4',
  error: 'bg-red-4',
  info: 'bg-blue-5',
};

function Toast({ toast, onDone }: { toast: ToastItem; onDone: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const hide = window.setTimeout(() => setVisible(false), 3000);
    const remove = window.setTimeout(() => onDone(toast.id), 3200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, [toast.id, onDone]);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-card transition-all duration-200 ease-out ${
        TONE_STYLES[toast.tone]
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
    >
      <span className={`size-2 shrink-0 rounded-full ${DOT_STYLES[toast.tone]}`} />
      <p className="text-sm font-bold text-secondary-7">{toast.message}</p>
    </div>
  );
}

export default function ToastStack({ toasts, onDone }: { toasts: ToastItem[]; onDone: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={onDone} />
      ))}
    </div>
  );
}
