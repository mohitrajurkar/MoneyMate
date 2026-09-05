import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;
  const safeNotifs = notifications || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div
        id="notification-drawer-panel"
        className="w-full max-w-sm h-full bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>{safeNotifs.length} updates</span>
            {safeNotifs.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-red-400 hover:text-red-300 font-medium cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[70vh] pr-1">
            {safeNotifs.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                You're all caught up! No unread alerts.
              </div>
            ) : (
              safeNotifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.read
                      ? 'bg-neutral-950/40 border-neutral-800/40 opacity-70'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'WARNING' || n.type === 'ALERT' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : n.type === 'SUCCESS' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-neutral-500 block mt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
