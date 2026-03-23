
import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const notify = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmDialog({ options, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(value);
      setConfirmDialog(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center space-y-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-gold/10 border-gold/20 text-gold'
              }`}
            >
              {n.type === 'success' && <CheckCircle2 size={20} />}
              {n.type === 'error' && <AlertCircle size={20} />}
              {n.type === 'info' && <Info size={20} />}
              <span className="font-bold text-sm italic uppercase tracking-tight">{n.message}</span>
              <button 
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => handleConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-[#222] rounded-[2.5rem] p-8 shadow-2xl"
            >
              <h3 className="text-xl font-black italic uppercase tracking-tight text-gold mb-2">
                {confirmDialog.options.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {confirmDialog.options.message}
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleConfirm(false)}
                  className="flex-1 py-4 rounded-2xl bg-[#1A1A1A] text-gray-400 font-bold uppercase tracking-widest text-xs border border-[#222] hover:bg-[#222] transition-all"
                >
                  {confirmDialog.options.cancelText || 'Cancelar'}
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  className="flex-1 py-4 rounded-2xl bg-gold text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-gold/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  {confirmDialog.options.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
