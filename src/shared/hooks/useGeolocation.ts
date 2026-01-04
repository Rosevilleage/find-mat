import { useState, useEffect } from "react";

/**
 * 지리적 좌표
 */
export interface GeoCoordinates {
  lat: number;
  lng: number;
}

/**
 * useGeolocation 훅 반환 타입
 */
interface UseGeolocationReturn {
  /** 현재 위치 좌표 */
  coordinates: GeoCoordinates | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
}

/**
 * 서울 기본 좌표
 */
const SEOUL_COORDINATES: GeoCoordinates = {
  lat: 37.5665,
  lng: 126.978,
};

/**
 * 사용자의 현재 위치를 가져오는 커스텀 훅
 *
 * Geolocation API를 사용하여 사용자의 현재 위치를 가져옵니다.
 * 위치를 가져오지 못하면 서울 좌표를 반환합니다.
 *
 * @returns 현재 위치 좌표, 로딩 상태, 에러
 *
 * @example
 * ```tsx
 * const { coordinates, isLoading, error } = useGeolocation();
 *
 * if (isLoading) return <div>위치 정보를 가져오는 중...</div>;
 * if (coordinates) return <Map center={coordinates} />;
 * ```
 */
export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Geolocation API 지원 여부 확인
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setCoordinates(SEOUL_COORDINATES);
      setIsLoading(false);
      return;
    }

    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        // 에러 발생 시 서울 좌표 사용
        let errorMessage = "Failed to get location";

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "User denied location permission";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case err.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }

        setError(errorMessage);
        setCoordinates(SEOUL_COORDINATES);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    coordinates,
    isLoading,
    error,
  };
}
