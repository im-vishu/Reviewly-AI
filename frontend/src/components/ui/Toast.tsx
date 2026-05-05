import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Toast } from './useToast';

const iconMap = {
  success: <CheckCircle size={18} className="text-emerald-400" />,
  error: <AlertCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-cyan-400" />,
};

const colorMap = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  info: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border animate-in slide-in-from-right ${colorMap[toast.type]}`}
        >
          {iconMap[toast.type]}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => onDismiss(toast.id)} className="text-current/60 hover:text-current">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
