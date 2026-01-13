import { useEffect, useRef } from "react";
import {
  createMarker,
  addMarkerClickEvent,
  updateMarkerStyle,
  createCustomOverlay,
  type MarkerPosition,
} from "@/shared/lib/kakao-map";
import { MARKER_CONFIG } from "@/shared/config";

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
 * 마커 데이터 (마커 인스턴스, 오버레이, 레스토랑 정보를 함께 저장)
 */
interface MarkerData {
  marker: kakao.maps.Marker;
  overlay: kakao.maps.CustomOverlay;
  overlayContent: HTMLElement;
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

    // 기존 마커 및 오버레이 제거
    markersRef.current.forEach(({ marker, overlay }) => {
      marker.setMap(null);
      overlay.setMap(null);
    });
    markersRef.current = [];

    // restaurants가 없으면 마커 생성하지 않음
    if (!restaurants || restaurants.length === 0) {
      return;
    }

    // 새 마커 및 오버레이 생성
    const newMarkers: MarkerData[] = restaurants.map((restaurant) => {
      const position: MarkerPosition = {
        lat: restaurant.lat,
        lng: restaurant.lng,
      };

      // 마커 생성 시 바로 커스텀 이미지 적용
      const marker = createMarker(position, {
        map,
        title: restaurant.name,
        clickable: true,
        imageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      // 클릭 이벤트 리스너 추가
      if (onMarkerClick) {
        addMarkerClickEvent(marker, () => {
          onMarkerClick(restaurant);
        });
      }

      // 오버레이 컨텐츠 생성 (식당 이름)
      const overlayContent = document.createElement("div");
      overlayContent.style.cssText = `
        position: relative;
        padding: 6px 12px;
        background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
        color: white;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
        transition: all 0.2s ease;
        border: 2px solid rgba(255, 255, 255, 0.2);
      `;
      overlayContent.textContent = restaurant.name;

      // 커스텀 오버레이 생성 (마커 상단에 표시)
      const overlay = createCustomOverlay(position, {
        map,
        content: overlayContent,
        zIndex: 20,
        clickable: false,
        yAnchor: 2.7, // 마커 상단에 표시
      });

      return {
        marker,
        overlay,
        overlayContent,
        restaurant,
      };
    });

    markersRef.current = newMarkers;

    // Cleanup: 컴포넌트 언마운트 시 마커 및 오버레이 제거
    return () => {
      markersRef.current.forEach(({ marker, overlay }) => {
        marker.setMap(null);
        overlay.setMap(null);
      });
      markersRef.current = [];
    };
  }, [map, restaurants, onMarkerClick]);

  /**
   * 선택된 마커 및 오버레이 스타일 업데이트
   */
  useEffect(() => {
    // 지도가 없으면 스타일 업데이트하지 않음
    if (!map) {
      return;
    }

    // 모든 마커 및 오버레이의 스타일 업데이트
    markersRef.current.forEach(({ marker, overlayContent, restaurant }) => {
      const isSelected = restaurant.id === selectedId;

      // 마커 스타일 업데이트 (커스텀 이미지 사용)
      updateMarkerStyle(marker, isSelected, {
        selectedImageSrc: MARKER_CONFIG.selected.src,
        normalImageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      // 오버레이 스타일 업데이트 (선택된 마커는 노란색 강조)
      if (isSelected) {
        overlayContent.style.border = "2px solid #FBBF24";
        overlayContent.style.boxShadow =
          "0 4px 12px rgba(251, 191, 36, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)";
        overlayContent.style.transform = "scale(1.05)";
      } else {
        overlayContent.style.border = "2px solid rgba(255, 255, 255, 0.2)";
        overlayContent.style.boxShadow =
          "0 3px 8px rgba(79, 70, 229, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)";
        overlayContent.style.transform = "scale(1)";
      }

      // 삼각형 꼬리 색상도 업데이트
      const arrow = overlayContent.lastElementChild as HTMLElement;
      if (arrow && isSelected) {
        arrow.style.borderTopColor = "#FBBF24";
      } else if (arrow) {
        arrow.style.borderTopColor = "#4F46E5";
      }
    });
  }, [map, selectedId]);
}
