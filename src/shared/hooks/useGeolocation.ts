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

    console.log("📍 위치 정보 요청 시작...");

    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ 위치 정보 가져오기 성공:", {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        // 에러 발생 시 서울 좌표 사용
        let errorMessage = "위치 정보를 가져올 수 없습니다";

        console.error("❌ 위치 정보 에러 상세:", {
          code: err.code,
          message: err.message,
          PERMISSION_DENIED: err.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: err.POSITION_UNAVAILABLE,
          TIMEOUT: err.TIMEOUT,
        });

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = "위치 권한이 거부되었습니다. 서울 지역으로 검색합니다.";
            console.warn("🚫 브라우저에서 위치 권한이 거부되었습니다.");
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다. 서울 지역으로 검색합니다.";
            console.warn(
              "📍 위치 정보를 사용할 수 없습니다. macOS 사용자의 경우 '시스템 환경설정 > 보안 및 개인 정보 보호 > 개인 정보 보호 > 위치 서비스'에서 위치 서비스가 활성화되어 있는지 확인하세요."
            );
            break;
          case err.TIMEOUT:
            errorMessage = "위치 요청 시간이 초과되었습니다. 서울 지역으로 검색합니다.";
            console.warn("⏱️ 위치 정보 요청 시간이 초과되었습니다 (10초)");
            break;
        }

        console.warn("⚠️ 위치 정보 에러:", errorMessage);
        setError(errorMessage);
        setCoordinates(SEOUL_COORDINATES);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false, // 빠른 응답을 위해 정확도 낮춤
        timeout: 10000, // 10초로 늘림
        maximumAge: 300000, // 5분 이내 캐시된 위치 사용 가능
      }
    );
  }, []);

  return {
    coordinates,
    isLoading,
    error,
  };
}
