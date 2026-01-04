import { IconNavigation } from "@tabler/icons-react";
import { motion } from "framer-motion";

/**
 * CurrentLocationButton 컴포넌트 Props
 */
export interface CurrentLocationButtonProps {
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 현재 위치로 이동하는 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <CurrentLocationButton
 *   onClick={moveToCurrentLocation}
 *   isLoading={isLocationLoading}
 *   disabled={isLocationLoading}
 * />
 * ```
 */
export function CurrentLocationButton({
  onClick,
  isLoading,
  disabled = false,
  className = "",
}: CurrentLocationButtonProps) {
  return (
    <motion.button
      data-testid="current-location-button"
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
      ) : (
        <IconNavigation className="w-5 h-5 text-primary" fill="currentColor" />
      )}
    </motion.button>
  );
}
