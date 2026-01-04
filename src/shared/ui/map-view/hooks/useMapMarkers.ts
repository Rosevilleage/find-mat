import { useEffect, useRef } from "react";
import {
  createMarker,
  addMarkerClickEvent,
  type MarkerPosition,
} from "@/shared/lib/kakao-map";

/**
 * 지도에 표시할 레스토랑 정보
 */
export interface MapRestaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * useMapMarkers 훅 옵션
 */
export interface UseMapMarkersOptions {
  /** 지도 인스턴스 */
  map: kakao.maps.Map | null;
  /** 레스토랑 목록 */
  restaurants: MapRestaurant[];
  /** 선택된 레스토랑 ID */
  selectedId?: string;
  /** 마커 클릭 콜백 */
  onMarkerClick?: (restaurant: MapRestaurant) => void;
}

/**
 * 마커 데이터 (마커 인스턴스와 레스토랑 정보를 함께 저장)
 */
interface MarkerData {
  marker: kakao.maps.Marker;
  restaurant: MapRestaurant;
}

/**
 * Kakao Map에 레스토랑 마커를 표시하고 관리하는 커스텀 훅
 *
 * @param options - 마커 관리 옵션
 *
 * @example
 * ```tsx
 * useMapMarkers({
 *   map: mapInstance,
 *   restaurants: restaurants,
 *   selectedId: selectedRestaurantId,
 *   onMarkerClick: handleMarkerClick
 * });
 * ```
 */
export function useMapMarkers(options: UseMapMarkersOptions): void {
  const { map, restaurants, selectedId, onMarkerClick } = options;

  // 마커 데이터를 저장하는 ref
  const markersRef = useRef<MarkerData[]>([]);

  /**
   * 마커 생성 및 업데이트
   */
  useEffect(() => {
    // 지도가 없으면 마커 생성하지 않음
    if (!map) {
      return;
    }

    // 기존 마커 제거
    markersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // restaurants가 없으면 마커 생성하지 않음
    if (!restaurants || restaurants.length === 0) {
      return;
    }

    // 새 마커 생성
    const newMarkers: MarkerData[] = restaurants.map((restaurant) => {
      const position: MarkerPosition = {
        lat: restaurant.lat,
        lng: restaurant.lng,
      };

      const marker = createMarker(position, {
        map,
        title: restaurant.name,
        clickable: true,
      });

      // 클릭 이벤트 리스너 추가
      if (onMarkerClick) {
        addMarkerClickEvent(marker, () => {
          onMarkerClick(restaurant);
        });
      }

      return {
        marker,
        restaurant,
      };
    });

    markersRef.current = newMarkers;

    // Cleanup: 컴포넌트 언마운트 시 마커 제거
    return () => {
      markersRef.current.forEach(({ marker }) => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [map, restaurants, onMarkerClick]);

  /**
   * 선택된 마커 스타일 업데이트
   */
  useEffect(() => {
    // 지도가 없으면 스타일 업데이트하지 않음
    if (!map) {
      return;
    }

    // 모든 마커의 스타일 업데이트
    markersRef.current.forEach(({ marker, restaurant }) => {
      const isSelected = restaurant.id === selectedId;

      // 커스텀 마커 이미지 사용하지 않고 기본 마커 사용
      // updateMarkerStyle을 사용하려면 커스텀 이미지가 필요하므로
      // 현재는 z-index만 변경
      const zIndex = isSelected ? 100 : 1;
      marker.setZIndex(zIndex);
    });
  }, [map, selectedId]);
}
