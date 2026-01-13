import { useEffect, useRef } from "react";

/**
 * 사용자 위치 좌표
 */
interface UserLocation {
  lat: number;
  lng: number;
}

/**
 * useUserLocationMarker 훅 옵션
 */
interface UseUserLocationMarkerOptions {
  /** 지도 인스턴스 */
  map: kakao.maps.Map | null;
  /** 사용자 위치 좌표 */
  userLocation: UserLocation | null | undefined;
}

/**
 * 지도에 사용자 위치를 붉은색 점으로 표시하는 커스텀 훅
 *
 * @param options - 사용자 위치 마커 옵션
 *
 * @example
 * ```tsx
 * useUserLocationMarker({
 *   map: mapInstance,
 *   userLocation: { lat: 37.5665, lng: 126.978 }
 * });
 * ```
 */
export function useUserLocationMarker(
  options: UseUserLocationMarkerOptions
): void {
  const { map, userLocation } = options;

  // CustomOverlay 인스턴스를 저장하는 ref
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  useEffect(() => {
    // 지도가 없거나 사용자 위치가 없으면 오버레이 생성하지 않음
    if (!map || !userLocation) {
      // 기존 오버레이 제거
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
      return;
    }

    // 기존 오버레이 제거
    if (overlayRef.current) {
      overlayRef.current.setMap(null);
      overlayRef.current = null;
    }

    // 붉은색 점 HTML 엘리먼트 생성
    const content = document.createElement("div");
    content.style.cssText = `
      width: 16px;
      height: 16px;
      background-color: #ef4444;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    // CustomOverlay 생성
    const position = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);

    const overlay = new kakao.maps.CustomOverlay({
      position,
      content,
      zIndex: 10, // 일반 마커보다 낮게 설정
    });

    // 지도에 오버레이 표시
    overlay.setMap(map);
    overlayRef.current = overlay;

    // Cleanup: 컴포넌트 언마운트 시 오버레이 제거
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
        overlayRef.current = null;
      }
    };
  }, [map, userLocation]);
}
