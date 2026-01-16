import { createContext } from "react";

// Toast 타입 정의
export type ToastType = "success" | "error" | "info";

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// Context 생성 및 export
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);
