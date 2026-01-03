import { useCallback } from "react";
import { IconNavigation } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useKakaoMap } from "./hooks";

/**
 * 지도에 표시할 레스토랑 정보
 */
interface MapRestaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  isSelected?: boolean;
}

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
  restaurants: _restaurants,
  onPinClick: _onPinClick,
  selectedId: _selectedId,
  center = DEFAULT_CENTER,
  level = DEFAULT_LEVEL,
}: MapViewProps) {
  // TODO: Phase 4에서 마커 기능 구현 시 사용 예정
  void _restaurants;
  void _onPinClick;
  void _selectedId;

  const { mapContainerRef, mapInstance, isLoading, error } = useKakaoMap({
    center,
    level,
  });

  /**
   * 현재 위치 버튼 클릭 핸들러
   */
  const handleCurrentLocationClick = useCallback(() => {
    if (!mapInstance) {
      return;
    }

    // TODO: Phase 5에서 현재 위치 기능 구현
    // Geolocation API를 사용하여 현재 위치 가져오기
  }, [mapInstance]);

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

      {/* Current Location Button */}
      <motion.button
        data-testid="current-location-button"
        onClick={handleCurrentLocationClick}
        whileTap={{ scale: 0.9 }}
        className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
      >
        <IconNavigation className="w-5 h-5 text-primary" fill="currentColor" />
      </motion.button>
    </div>
  );
}
