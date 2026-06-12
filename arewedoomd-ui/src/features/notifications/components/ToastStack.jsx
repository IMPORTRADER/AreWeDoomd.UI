import { createPortal } from 'react-dom';
import { useNotifications } from '../hooks/useNotifications';
import NotificationToast from './NotificationToast';

const MAX_VISIBLE_TOASTS = 4;

export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0 || typeof document === 'undefined') {
    return null;
  }

  const visible = toasts.slice(0, MAX_VISIBLE_TOASTS);

  return createPortal(
    <div className="pointer-events-none fixed bottom-4 right-4 z-[2147483647] flex flex-col gap-3 pb-[env(safe-area-inset-bottom)]">
      {visible.map((toast) => (
        <NotificationToast
          key={toast.toastId}
          notification={toast}
          onDismiss={() => dismissToast(toast.toastId)}
        />
      ))}
    </div>,
    document.body,
  );
}
