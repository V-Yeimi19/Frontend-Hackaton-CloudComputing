import { X, Check, Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export interface Notification {
  id: string;
  userId: string;
  type: 'report_created' | 'status_changed';
  title: string;
  message: string;
  incidentId?: string;
  incidentCategory?: string;
  oldStatus?: string;
  newStatus?: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationsPanel({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Hace 1 día';
    return `Hace ${diffInDays} días`;
  };

  const getNotificationIcon = (type: string, newStatus?: string) => {
    if (type === 'report_created') {
      return <Bell className="h-5 w-5 text-blue-600" />;
    }

    switch (newStatus) {
      case 'Atendiendo':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'Finalizado':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Atendiendo':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Finalizado':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 font-semibold">Notificaciones</h2>
              {unreadCount > 0 && (
                <p className="text-gray-600 text-sm">{unreadCount} sin leer</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && unreadCount > 0 && (
          <div className="p-3 border-b bg-gray-50">
            <Button
              onClick={onMarkAllAsRead}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-2">No tienes notificaciones</p>
              <p className="text-gray-600 text-sm">
                Te notificaremos sobre actualizaciones de tus reportes
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type, notification.newStatus)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>

                        {notification.incidentCategory && (
                          <p className="text-gray-500 text-sm mb-2">
                            Categoría: <span className="font-medium">{notification.incidentCategory}</span>
                          </p>
                        )}

                        {notification.type === 'status_changed' && notification.oldStatus && notification.newStatus && (
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusBadgeColor(notification.oldStatus)}>
                              {notification.oldStatus}
                            </Badge>
                            <span className="text-gray-400">→</span>
                            <Badge className={getStatusBadgeColor(notification.newStatus)}>
                              {notification.newStatus}
                            </Badge>
                          </div>
                        )}

                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
