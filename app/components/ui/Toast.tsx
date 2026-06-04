"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "danger" | "info";

interface Toast {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration: number;
  persistent?: boolean;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id" | "variant" | "duration"> & {
    variant?: ToastVariant;
    duration?: number;
  }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast: ToastContextValue["toast"] = useCallback(
    (t) => {
      const id = Math.random().toString(36).slice(2, 9);
      const next: Toast = {
        id,
        title: t.title,
        description: t.description,
        variant: t.variant ?? "default",
        duration: t.duration ?? 4000,
        persistent: t.persistent,
        action: t.action,
      };
      setToasts((prev) => [...prev, next]);
      if (!t.persistent) {
        setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-[400px] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const variantStyles: Record<ToastVariant, { bg: string; iconColor: string; Icon: typeof Check }> = {
  default: {
    bg: "bg-ink-800 text-ink-50 border-ink-700",
    iconColor: "text-ink-300",
    Icon: Info,
  },
  success: {
    bg: "bg-ink-800 text-ink-50 border-ink-700",
    iconColor: "text-anima-300",
    Icon: Check,
  },
  danger: {
    bg: "bg-ink-800 text-ink-50 border-ink-700",
    iconColor: "text-[#d97a6e]",
    Icon: AlertCircle,
  },
  info: {
    bg: "bg-ink-800 text-ink-50 border-ink-700",
    iconColor: "text-ink-300",
    Icon: Info,
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const { Icon, bg, iconColor } = variantStyles[toast.variant];
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast.persistent) {
      const t = setTimeout(() => setLeaving(true), toast.duration - 200);
      return () => clearTimeout(t);
    }
  }, [toast.duration, toast.persistent]);

  return (
    <div
      className={`pointer-events-auto rounded-[10px] border ${bg} shadow-[0_12px_32px_rgba(11,10,7,0.20),0_4px_8px_rgba(11,10,7,0.10)] px-4 py-3 flex items-start gap-3 ${
        leaving ? "animate-fade-in opacity-0" : "animate-slide-up"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} className={`mt-0.5 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-[13px] font-medium leading-[1.4] mb-0.5">
            {toast.title}
          </p>
        )}
        <p className="text-[12.5px] text-ink-200 leading-[1.55]">
          {toast.description}
        </p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 text-[12px] font-medium text-anima-300 hover:text-anima-200 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-400 hover:text-ink-200 transition-colors -mr-1 -mt-0.5"
        aria-label="닫기"
      >
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
