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
 * Vercel Best Practice: rerender-defer-reads
 * - Toast 상태를 Context로 분리하여 prop drilling 제거
 * - showToast 함수를 안정적으로 제공
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

  // Vercel Best Practice: rerender-functional-setstate
  // setToast는 안정적이므로 의존성 배열에 포함하지 않아도 됨
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
