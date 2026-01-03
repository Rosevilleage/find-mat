import { useEffect, useRef, useState, useCallback } from "react";
import { createMap, isSDKLoaded, type CreateMapOptions } from "@/shared/lib/kakao-map";

/**
 * 지도 중심 좌표
 */
interface MapCenter {
  lat: number;
  lng: number;
}

/**
 * useKakaoMap 훅 옵션
 */
interface UseKakaoMapOptions {
  /** 지도 중심 좌표 */
  center: MapCenter;
  /** 지도 줌 레벨 (기본값: 3) */
  level?: number;
}

/**
 * useKakaoMap 훅 반환 타입
 */
interface UseKakaoMapReturn {
  /** 지도 컨테이너 ref */
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  /** 지도 인스턴스 */
  mapInstance: kakao.maps.Map | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * Kakao Map 초기화를 관리하는 커스텀 훅
 *
 * @param options - 지도 초기화 옵션
 * @returns 지도 컨테이너 ref, 인스턴스, 상태
 *
 * @example
 * ```tsx
 * const { mapContainerRef, mapInstance, isLoading, error } = useKakaoMap({
 *   center: { lat: 37.5665, lng: 126.978 },
 *   level: 3
 * });
 *
 * return <div ref={mapContainerRef} />;
 * ```
 */
export function useKakaoMap(options: UseKakaoMapOptions): UseKakaoMapReturn {
  const { center, level = 3 } = options;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 지도 초기화
   */
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current) {
      return;
    }

    try {
      // SDK 로드 확인
      if (!isSDKLoaded()) {
        throw new Error("Kakao Map SDK is not loaded");
      }

      const mapOptions: CreateMapOptions = {
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        level,
      };

      const map = createMap(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
      setIsLoading(false);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Map initialization failed";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [center.lat, center.lng, level]);

  /**
   * 컴포넌트 마운트 시 지도 초기화
   */
  useEffect(() => {
    // SDK가 이미 로드되었는지 확인
    if (isSDKLoaded()) {
      initializeMap();
    } else {
      // SDK 로드 대기 (kakao.maps.load 사용)
      try {
        kakao.maps.load(() => {
          initializeMap();
        });
      } catch {
        setError("Kakao Map SDK is not available");
        setIsLoading(false);
      }
    }

    // Cleanup
    return () => {
      mapInstanceRef.current = null;
    };
  }, [initializeMap]);

  return {
    mapContainerRef,
    mapInstance: mapInstanceRef.current,
    isLoading,
    error,
  };
}
