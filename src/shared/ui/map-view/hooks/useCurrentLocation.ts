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
  PERMISSION_DENIED: "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.",
  POSITION_UNAVAILABLE: "시스템 위치 서비스가 비활성화되어 있습니다. 시스템 설정에서 활성화해주세요.",
  TIMEOUT: "위치 요청 시간이 초과되었습니다. 다시 시도해주세요.",
  DEFAULT: "위치를 가져올 수 없습니다",
} as const;

/** Geolocation API 옵션 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false, // 빠른 응답을 위해 정확도 낮춤
  timeout: 10000, // 10초로 늘림
  maximumAge: 300000, // 5분 이내 캐시된 위치 사용 가능
};

/** 에러 토스트 표시 시간 (밀리초) */
const ERROR_TOAST_DURATION = 5000;

/** 기본 중심 좌표 (서울) - 위치 접근 실패 시 폴백 */
const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.978,
};

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
  const moveToCurrentLocation = useCallback(async () => {
    if (!map) {
      return;
    }

    // Geolocation API 사용 가능 여부 확인
    if (!navigator.geolocation) {
      setError(ERROR_MESSAGES.NOT_SUPPORTED);
      // Geolocation API를 지원하지 않는 경우에도 기본 center(서울)로 이동
      console.log("📍 Geolocation API를 지원하지 않습니다. 기본 위치(서울)로 이동합니다.");
      setCenter(map, DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 권한 상태 먼저 확인 (Permissions API 지원 브라우저만)
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });

        console.log("🔐 현재 위치 버튼 - 권한 상태:", permissionStatus.state);

        // 권한이 거부된 경우 바로 에러 표시 및 기본 center로 이동
        if (permissionStatus.state === "denied") {
          setError(ERROR_MESSAGES.PERMISSION_DENIED);
          console.log("📍 위치 권한이 거부되었습니다. 기본 위치(서울)로 이동합니다.");
          setCenter(map, DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn("⚠️ 권한 확인 실패:", error);
        // 권한 확인 실패 시 계속 진행
      }
    }

    navigator.geolocation.getCurrentPosition(
      // 성공 콜백
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("✅ 현재 위치로 이동:", {
          lat: latitude,
          lng: longitude,
          accuracy: position.coords.accuracy,
        });

        // 지도 중심을 현재 위치로 이동
        setCenter(map, latitude, longitude);

        setIsLoading(false);
      },
      // 에러 콜백
      (geolocationError) => {
        let errorMessage: string = ERROR_MESSAGES.DEFAULT;

        console.error("❌ 현재 위치 버튼 - 에러 상세:", {
          code: geolocationError.code,
          message: geolocationError.message,
        });

        switch (geolocationError.code) {
          case geolocationError.PERMISSION_DENIED:
            errorMessage = ERROR_MESSAGES.PERMISSION_DENIED;
            console.warn("🚫 위치 권한이 거부되었습니다.");
            break;
          case geolocationError.POSITION_UNAVAILABLE:
            errorMessage = ERROR_MESSAGES.POSITION_UNAVAILABLE;
            console.warn("📍 위치 정보를 사용할 수 없습니다.");
            break;
          case geolocationError.TIMEOUT:
            errorMessage = ERROR_MESSAGES.TIMEOUT;
            console.warn("⏱️ 위치 요청 시간이 초과되었습니다 (10초)");
            break;
        }

        setError(errorMessage);

        // 위치를 가져올 수 없는 경우 기본 center(서울)로 이동
        console.log("📍 기본 위치(서울)로 이동합니다.");
        setCenter(map, DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

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
