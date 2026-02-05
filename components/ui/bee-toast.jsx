"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const ToastContext = React.createContext(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const TOAST_DURATION = 3000;

const toastVariants = {
  success: {
    icon: IconCheck,
    bgClass: "bg-[#F6EEE5] dark:bg-cat-frappe-surface0",
    borderClass: "border-cat-frappe-green",
    iconBgClass: "bg-cat-frappe-green/20",
    iconTextClass: "text-cat-frappe-green",
    progressClass: "bg-cat-frappe-green",
  },
  error: {
    icon: IconX,
    bgClass: "bg-[#F6EEE5] dark:bg-cat-frappe-surface0",
    borderClass: "border-cat-frappe-red",
    iconBgClass: "bg-cat-frappe-red/20",
    iconTextClass: "text-cat-frappe-red",
    progressClass: "bg-cat-frappe-red",
  },
  warning: {
    icon: IconAlertTriangle,
    bgClass: "bg-[#F6EEE5] dark:bg-cat-frappe-surface0",
    borderClass: "border-cat-frappe-yellow",
    iconBgClass: "bg-cat-frappe-yellow/20",
    iconTextClass: "text-cat-frappe-yellow",
    progressClass: "bg-cat-frappe-yellow",
  },
  info: {
    icon: IconInfoCircle,
    bgClass: "bg-[#F6EEE5] dark:bg-cat-frappe-surface0",
    borderClass: "border-cat-frappe-peach",
    iconBgClass: "bg-cat-frappe-peach/20",
    iconTextClass: "text-cat-frappe-peach",
    progressClass: "bg-cat-frappe-peach",
  },
};

function Toast({ id, message, type = "success", onRemove }) {
  const [progress, setProgress] = React.useState(100);
  const variant = toastVariants[type] || toastVariants.info;
  const Icon = variant.icon;

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onRemove(id);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-lg border-2 shadow-lg min-w-[320px] max-w-[420px]",
        variant.bgClass,
        variant.borderClass
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <div className={cn("flex-shrink-0 rounded-full p-2", variant.iconBgClass)}>
          <Icon className={cn("h-5 w-5", variant.iconTextClass)} />
        </div>
        <p className="flex-1 text-sm font-medium text-cat-frappe-base dark:text-cat-frappe-text">
          {message}
        </p>
        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 rounded-full p-1 hover:bg-cat-frappe-surface1/30 transition-colors"
        >
          <IconX className="h-4 w-4 text-cat-frappe-overlay1 dark:text-cat-frappe-subtext0" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-cat-frappe-surface1/20 dark:bg-cat-frappe-surface2/50">
        <div
          className={cn("h-full transition-all duration-100 ease-linear", variant.progressClass)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

function ToastContainerInner({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onRemove={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Dynamically import with SSR disabled to prevent hydration mismatch
const ToastContainer = dynamic(
  () => Promise.resolve(ToastContainerInner),
  { ssr: false }
);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useMemo(
    () => ({
      success: (message) => addToast(message, "success"),
      error: (message) => addToast(message, "error"),
      warning: (message) => addToast(message, "warning"),
      info: (message) => addToast(message, "info"),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export { Toast };
