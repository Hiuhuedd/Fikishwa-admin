import { AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({ icon = '📭', message, action, onAction }: { icon?: string; message: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <span className="text-5xl">{icon}</span>
      <p className="text-textSecondary font-medium">{message}</p>
      {action && onAction && (
        <button onClick={onAction} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          <RefreshCw className="w-4 h-4" /> {action}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="p-3 bg-error/10 rounded-full"><AlertCircle className="w-8 h-8 text-error" /></div>
      <p className="text-error font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      )}
    </div>
  );
}
