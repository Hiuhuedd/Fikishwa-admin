'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue { showToast: (type: ToastType, message: string) => void; }

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error: <XCircle className="w-5 h-5 text-error" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-info" />,
};

const bg: Record<ToastType, string> = {
  success: 'border-l-4 border-success bg-success-light',
  error: 'border-l-4 border-error bg-error-light',
  warning: 'border-l-4 border-warning bg-warning-light',
  info: 'border-l-4 border-info bg-info-light',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white ${bg[t.type]} animate-in slide-in-from-right`}>
            {icons[t.type]}
            <p className="flex-1 text-sm font-medium text-textPrimary">{t.message}</p>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
              <X className="w-4 h-4 text-textMuted" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
