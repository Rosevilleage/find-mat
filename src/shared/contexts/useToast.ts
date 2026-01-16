import { useContext } from "react";
import { ToastContext } from "./toast-context";

/**
 * Toast를 사용하기 위한 커스텀 훅
 *
 * @returns showToast 함수
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showToast } = useToast();
 *
 *   const handleClick = () => {
 *     showToast("성공했습니다!", "success");
 *   };
 *
 *   return <button onClick={handleClick}>클릭</button>;
 * }
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
