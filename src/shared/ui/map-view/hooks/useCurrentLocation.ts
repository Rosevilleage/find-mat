import { useState, useCallback, useEffect } from "react";
import { setCenter } from "@/shared/lib/kakao-map";

/**
 * useCurrentLocation 훅 옵션
 */
export interface UseCurrentLocationOptions {
  /** 지도 인스턴스 */
  map: kakao.maps.Map | null;
}

/**
 * useCurrentLocation 훅 반환 타입
 */
export interface UseCurrentLocationReturn {
  /** 현재 위치 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 현재 위치로 이동하는 함수 */
  moveToCurrentLocation: () => void;
}

/** 에러 메시지 상수 */
const ERROR_MESSAGES = {
  NOT_SUPPORTED: "위치 정보를 사용할 수 없습니다",
  PERMISSION_DENIED: "위치 권한이 거부되었습니다",
  POSITION_UNAVAILABLE: "위치 정보를 사용할 수 없습니다",
  TIMEOUT: "위치 요청 시간이 초과되었습니다",
  DEFAULT: "위치를 가져올 수 없습니다",
} as const;

/** Geolocation API 옵션 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

/** 에러 토스트 표시 시간 (밀리초) */
const ERROR_TOAST_DURATION = 5000;

/**
 * 현재 위치 가져오기 및 지도 이동을 관리하는 커스텀 훅
 *
 * @param options - 훅 옵션
 * @returns 현재 위치 상태 및 이동 함수
 *
 * @example
 * ```tsx
 * const { isLoading, error, moveToCurrentLocation } = useCurrentLocation({
 *   map: mapInstance
 * });
 *
 * <button onClick={moveToCurrentLocation} disabled={isLoading}>
 *   현재 위치
 * </button>
 * ```
 */
export function useCurrentLocation(
  options: UseCurrentLocationOptions
): UseCurrentLocationReturn {
  const { map } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 에러 메시지 자동 제거 (5초 후)
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, ERROR_TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [error]);

  /**
   * 현재 위치로 지도 이동
   */
  const moveToCurrentLocation = useCallback(() => {
    if (!map) {
      return;
    }

    // Geolocation API 사용 가능 여부 확인
    if (!navigator.geolocation) {
      setError(ERROR_MESSAGES.NOT_SUPPORTED);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        const { latitude, longitude } = position.coords;

        // 지도 중심을 현재 위치로 이동
        setCenter(map, latitude, longitude);

        setIsLoading(false);
      },
      // 에러 콜백
      (geolocationError) => {
        let errorMessage: string = ERROR_MESSAGES.DEFAULT;

        switch (geolocationError.code) {
          case geolocationError.PERMISSION_DENIED:
            errorMessage = ERROR_MESSAGES.PERMISSION_DENIED;
            break;
          case geolocationError.POSITION_UNAVAILABLE:
            errorMessage = ERROR_MESSAGES.POSITION_UNAVAILABLE;
            break;
          case geolocationError.TIMEOUT:
            errorMessage = ERROR_MESSAGES.TIMEOUT;
            break;
        }

        setError(errorMessage);
        setIsLoading(false);
      },
      // 옵션
      GEOLOCATION_OPTIONS
    );
  }, [map]);

  return {
    isLoading,
    error,
    moveToCurrentLocation,
  };
}
