/**
 * Kakao Map 지도 초기화 및 관리 유틸리티
 *
 * 지도 인스턴스 생성, 중심 좌표 설정, 줌 레벨 제어 등의 기능을 제공합니다.
 *
 * @module shared/lib/kakao-map/map-manager
 */

import "./types";

/**
 * 지도 생성 옵션
 */
export interface CreateMapOptions {
  /** 지도 중심 좌표 */
  center: {
    lat: number;
    lng: number;
  };
  /** 지도 줌 레벨 (1-14, 기본값: 3) */
  level?: number;
}

/**
 * 지도 줌 레벨 설정 옵션
 */
export interface SetLevelOptions {
  /** 애니메이션 사용 여부 */
  animate?: boolean;
}

/**
 * Kakao Map 지도 인스턴스를 생성합니다.
 *
 * @param container - 지도를 표시할 HTML 엘리먼트
 * @param options - 지도 생성 옵션 (중심 좌표, 줌 레벨)
 * @returns 생성된 Kakao Map 인스턴스
 * @throws {Error} 컨테이너가 없거나 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * const container = document.getElementById('map');
 * const map = createMap(container, {
 *   center: { lat: 37.5665, lng: 126.978 },
 *   level: 3
 * });
 * ```
 */
export function createMap(
  container: HTMLElement,
  options: CreateMapOptions
): kakao.maps.Map {
  // 컨테이너 검증
  if (!container) {
    throw new Error("Map container element is required");
  }

  if (!(container instanceof HTMLElement)) {
    throw new Error("Map container must be an HTMLElement");
  }

  // 기본 줌 레벨 설정
  const level = options.level ?? 3;

  // 중심 좌표 생성
  const center = new kakao.maps.LatLng(options.center.lat, options.center.lng);

  // 지도 생성 및 반환
  const map = new kakao.maps.Map(container, {
    center,
    level,
  });

  return map;
}

/**
 * 지도의 중심 좌표를 설정합니다.
 *
 * @param map - Kakao Map 인스턴스
 * @param lat - 위도
 * @param lng - 경도
 * @throws {Error} 지도 인스턴스가 없거나 좌표가 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * setCenter(map, 37.5665, 126.978);
 * ```
 */
export function setCenter(
  map: kakao.maps.Map,
  lat: number,
  lng: number
): void {
  // 지도 인스턴스 검증
  if (!map) {
    throw new Error("Map instance is required");
  }

  // 좌표 유효성 검증
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    throw new Error("Invalid coordinates");
  }

  // 중심 좌표 설정
  const center = new kakao.maps.LatLng(lat, lng);
  map.setCenter(center);
}

/**
 * 지도의 줌 레벨을 설정합니다.
 *
 * @param map - Kakao Map 인스턴스
 * @param level - 줌 레벨 (1-14)
 * @param options - 줌 레벨 설정 옵션
 * @throws {Error} 지도 인스턴스가 없거나 레벨이 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * // 애니메이션 없이 줌 레벨 변경
 * setLevel(map, 5);
 *
 * // 애니메이션과 함께 줌 레벨 변경
 * setLevel(map, 5, { animate: true });
 * ```
 */
export function setLevel(
  map: kakao.maps.Map,
  level: number,
  options?: SetLevelOptions
): void {
  // 지도 인스턴스 검증
  if (!map) {
    throw new Error("Map instance is required");
  }

  // 줌 레벨 유효성 검증 (Kakao Map: 1-14)
  if (Number.isNaN(level) || level < 1 || level > 14) {
    throw new Error("Zoom level must be between 1 and 14");
  }

  // 줌 레벨 설정
  map.setLevel(level, options);
}
