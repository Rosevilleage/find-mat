import { useState, useCallback, type ReactNode } from "react";
import { Toast } from "@/shared/ui/toast";
import { ToastContext, type ToastType } from "./toast-context";

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

// Provider Props
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Context Provider
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
      />
    </ToastContext.Provider>
  );
}
