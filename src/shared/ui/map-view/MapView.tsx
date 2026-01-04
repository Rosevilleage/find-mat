import React from "react";
import {
  useKakaoMap,
  useMapMarkers,
  type MapRestaurant,
} from "./hooks";

/**
 * 지도 중심 좌표
 */
interface MapCenter {
  lat: number;
  lng: number;
}

/**
 * MapView 컴포넌트 props
 */
interface MapViewProps {
  /** 지도에 표시할 레스토랑 목록 */
  restaurants: MapRestaurant[];
  /** 핀 클릭 시 호출되는 콜백 */
  onPinClick: (restaurant: MapRestaurant) => void;
  /** 선택된 레스토랑 ID */
  selectedId?: string;
  /** 지도 중심 좌표 (기본값: 서울) */
  center?: MapCenter;
  /** 지도 줌 레벨 (기본값: 3) */
  level?: number;
  /** 지도 인스턴스 준비 완료 시 호출되는 콜백 */
  onMapReady?: (map: kakao.maps.Map) => void;
}

/** 기본 중심 좌표 (서울) */
const DEFAULT_CENTER: MapCenter = {
  lat: 37.5665,
  lng: 126.978,
};

/** 기본 줌 레벨 */
const DEFAULT_LEVEL = 3;

/**
 * Kakao Map을 렌더링하는 MapView 컴포넌트
 *
 * @example
 * ```tsx
 * <MapView
 *   restaurants={restaurants}
 *   onPinClick={handlePinClick}
 *   selectedId="1"
 *   center={{ lat: 37.5665, lng: 126.978 }}
 * />
 * ```
 */
export function MapView({
  restaurants,
  onPinClick,
  selectedId,
  center = DEFAULT_CENTER,
  level = DEFAULT_LEVEL,
  onMapReady,
}: MapViewProps) {
  const { mapContainerRef, mapInstance, isLoading, error } = useKakaoMap({
    center,
    level,
  });

  // 지도 인스턴스가 준비되면 콜백 호출
  React.useEffect(() => {
    if (mapInstance && onMapReady) {
      onMapReady(mapInstance);
    }
  }, [mapInstance, onMapReady]);

  // 마커 렌더링 및 관리
  useMapMarkers({
    map: mapInstance,
    restaurants,
    selectedId,
    onMarkerClick: onPinClick,
  });

  // 에러 상태 렌더링
  if (error) {
    return (
      <div className="relative w-full h-full bg-muted rounded-2xl overflow-hidden">
        <div
          data-testid="map-error"
          className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
        >
          <p className="text-sm">지도를 불러올 수 없습니다</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-muted rounded-2xl overflow-hidden">
      {/* Kakao Map Container */}
      <div
        ref={mapContainerRef}
        data-testid="kakao-map-container"
        className="absolute inset-0 w-full h-full"
      />

      {/* Loading State */}
      {isLoading && (
        <div
          data-testid="map-loading"
          className="absolute inset-0 flex items-center justify-center bg-muted"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
}
