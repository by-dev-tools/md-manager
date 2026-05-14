import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastInput {
  /** Short, single-line message. */
  message: string;
  /** Optional undo / retry action; shown as a button next to the message. */
  action?: ToastAction;
  /** Auto-dismiss in ms. If omitted, action toasts default to 8000 and
      passive toasts to 4000. Pass 0 to require manual dismiss. */
  durationMs?: number;
  /** 'assertive' interrupts screen reader output — use for destructive actions
      where the user must know immediately. 'polite' (default) waits for a quiet
      moment. */
  priority?: 'polite' | 'assertive';
}

interface Toast extends ToastInput {
  id: number;
}

interface ToastApi {
  push: (toast: ToastInput) => void;
  dismiss: (id: number) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, number>>(new Map());
  const nextIdRef = useRef(1);

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextIdRef.current++;
      const full: Toast = { id, ...toast };
      setToasts((ts) => [...ts, full]);
      // Action toasts need time to reach + read + click Undo — especially for
      // motor-impaired users. Default to 8s when there's an action, 4s when not.
      const defaultDuration = toast.action ? 8000 : 4000;
      const duration = toast.durationMs ?? defaultDuration;
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    return () => {
      for (const t of timersRef.current.values()) window.clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  // Use 'assertive' on the host if ANY current toast is assertive; otherwise
  // 'polite'. ARIA-live regions can't switch politeness per child, so this is
  // the pragmatic compromise.
  const liveness: 'assertive' | 'polite' = toasts.some(
    (t) => t.priority === 'assertive',
  )
    ? 'assertive'
    : 'polite';
  return (
    <div className="toast-host" role="status" aria-live={liveness}>
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="toast-message">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                t.action!.onClick();
                onDismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            className="toast-close"
            aria-label="Dismiss"
            onClick={() => onDismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
