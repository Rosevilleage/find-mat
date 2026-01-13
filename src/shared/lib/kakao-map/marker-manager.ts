/**
 * Kakao Map 마커 생성 및 관리 유틸리티
 *
 * 마커 생성, 스타일 업데이트, 이벤트 리스너 추가 등의 기능을 제공합니다.
 *
 * @module shared/lib/kakao-map/marker-manager
 */

import "./types";

/**
 * 마커 위치
 */
export interface MarkerPosition {
  lat: number;
  lng: number;
}

/**
 * 마커 생성 옵션
 */
export interface CreateMarkerOptions {
  /** 마커를 표시할 지도 인스턴스 */
  map?: kakao.maps.Map;
  /** 마커 이미지 URL */
  imageSrc?: string;
  /** 마커 이미지 크기 */
  imageSize?: {
    width: number;
    height: number;
  };
  /** 마커 타이틀 (마우스 오버 시 표시) */
  title?: string;
  /** 마커 클릭 가능 여부 */
  clickable?: boolean;
  /** 마커 z-index */
  zIndex?: number;
}

/**
 * 마커 스타일 업데이트 옵션
 */
export interface UpdateMarkerStyleOptions {
  /** 선택된 상태의 마커 이미지 URL */
  selectedImageSrc: string;
  /** 일반 상태의 마커 이미지 URL */
  normalImageSrc: string;
  /** 마커 이미지 크기 */
  imageSize: {
    width: number;
    height: number;
  };
}

/**
 * Kakao Map 마커를 생성합니다.
 *
 * @param position - 마커 위치 좌표
 * @param options - 마커 생성 옵션
 * @returns 생성된 Kakao Map 마커 인스턴스
 * @throws {Error} 위치가 없거나 좌표가 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * // 기본 마커 생성
 * const marker = createMarker(
 *   { lat: 37.5665, lng: 126.978 },
 *   { map, title: '서울시청' }
 * );
 *
 * // 커스텀 이미지 마커 생성
 * const marker = createMarker(
 *   { lat: 37.5665, lng: 126.978 },
 *   {
 *     map,
 *     imageSrc: '/marker-icon.png',
 *     imageSize: { width: 24, height: 24 }
 *   }
 * );
 * ```
 */
export function createMarker(
  position: MarkerPosition,
  options?: CreateMarkerOptions
): kakao.maps.Marker {
  // 위치 검증
  if (!position) {
    throw new Error("Position is required");
  }

  if (Number.isNaN(position.lat) || Number.isNaN(position.lng)) {
    throw new Error("Invalid position coordinates");
  }

  // 위치 객체 생성
  const markerPosition = new kakao.maps.LatLng(position.lat, position.lng);

  // 마커 옵션 구성
  const markerOptions: kakao.maps.MarkerOptions = {
    position: markerPosition,
    map: options?.map,
    title: options?.title,
    clickable: options?.clickable ?? true,
    zIndex: options?.zIndex,
  };

  // 커스텀 이미지가 있는 경우
  if (options?.imageSrc && options?.imageSize) {
    const imageSize = new kakao.maps.Size(
      options.imageSize.width,
      options.imageSize.height
    );

    const markerImage = new kakao.maps.MarkerImage(
      options.imageSrc,
      imageSize,
      undefined
    );

    markerOptions.image = markerImage;
  }

  // 마커 생성 및 반환
  const marker = new kakao.maps.Marker(markerOptions);

  return marker;
}

/**
 * 마커의 스타일을 업데이트합니다.
 *
 * 선택 상태에 따라 마커 이미지와 z-index를 변경합니다.
 *
 * @param marker - Kakao Map 마커 인스턴스
 * @param isSelected - 선택 상태 여부
 * @param options - 스타일 업데이트 옵션
 * @throws {Error} 마커 인스턴스가 없는 경우
 *
 * @example
 * ```typescript
 * // 마커를 선택 상태로 변경
 * updateMarkerStyle(marker, true, {
 *   selectedImageSrc: '/marker-selected.png',
 *   normalImageSrc: '/marker-normal.png',
 *   imageSize: { width: 24, height: 24 }
 * });
 * ```
 */
export function updateMarkerStyle(
  marker: kakao.maps.Marker,
  isSelected: boolean,
  options: UpdateMarkerStyleOptions
): void {
  // 마커 인스턴스 검증
  if (!marker) {
    throw new Error("Marker instance is required");
  }

  // 이미지 URL 선택
  const imageSrc = isSelected
    ? options.selectedImageSrc
    : options.normalImageSrc;

  // 마커 이미지 생성
  const imageSize = new kakao.maps.Size(
    options.imageSize.width,
    options.imageSize.height
  );

  const markerImage = new kakao.maps.MarkerImage(
    imageSrc,
    imageSize,
    undefined
  );

  // 마커 이미지 설정
  marker.setImage(markerImage);

  // z-index 설정 (선택된 마커가 위에 표시되도록)
  const zIndex = isSelected ? 100 : 1;
  marker.setZIndex(zIndex);
}

/**
 * 마커에 클릭 이벤트 리스너를 추가합니다.
 *
 * @param marker - Kakao Map 마커 인스턴스
 * @param callback - 클릭 시 실행될 콜백 함수
 * @throws {Error} 마커 인스턴스가 없거나 콜백이 함수가 아닌 경우
 *
 * @example
 * ```typescript
 * addMarkerClickEvent(marker, () => {
 *   console.log('마커가 클릭되었습니다!');
 * });
 * ```
 */
export function addMarkerClickEvent(
  marker: kakao.maps.Marker,
  callback: () => void
): void {
  // 마커 인스턴스 검증
  if (!marker) {
    throw new Error("Marker instance is required");
  }

  // 콜백 함수 검증
  if (typeof callback !== "function") {
    throw new Error("Callback must be a function");
  }

  // 클릭 이벤트 리스너 추가
  kakao.maps.event.addListener(marker, "click", callback);
}

/**
 * 커스텀 오버레이 생성 옵션
 */
export interface CreateCustomOverlayOptions {
  /** 오버레이를 표시할 지도 인스턴스 */
  map?: kakao.maps.Map;
  /** 오버레이 내용 (HTML 엘리먼트 또는 텍스트) */
  content: string | HTMLElement;
  /** 오버레이 z-index */
  zIndex?: number;
  /** 오버레이가 클릭 가능한지 여부 */
  clickable?: boolean;
  /** y축 오프셋 (마커 위에 띄우기 위한 값) */
  yAnchor?: number;
}

/**
 * Kakao Map 커스텀 오버레이를 생성합니다.
 *
 * @param position - 오버레이 위치 좌표
 * @param options - 오버레이 생성 옵션
 * @returns 생성된 Kakao Map 커스텀 오버레이 인스턴스
 * @throws {Error} 위치가 없거나 좌표가 올바르지 않은 경우
 *
 * @example
 * ```typescript
 * // 텍스트 오버레이 생성
 * const overlay = createCustomOverlay(
 *   { lat: 37.5665, lng: 126.978 },
 *   {
 *     map,
 *     content: '서울시청',
 *     zIndex: 20,
 *     yAnchor: 1.3
 *   }
 * );
 * ```
 */
export function createCustomOverlay(
  position: MarkerPosition,
  options: CreateCustomOverlayOptions
): kakao.maps.CustomOverlay {
  // 위치 검증
  if (!position) {
    throw new Error("Position is required");
  }

  if (Number.isNaN(position.lat) || Number.isNaN(position.lng)) {
    throw new Error("Invalid position coordinates");
  }

  // 위치 객체 생성
  const overlayPosition = new kakao.maps.LatLng(position.lat, position.lng);

  // 컨텐츠 처리
  let content: HTMLElement;
  if (typeof options.content === "string") {
    content = document.createElement("div");
    content.textContent = options.content;
  } else {
    content = options.content;
  }

  // 오버레이 옵션 구성
  const overlayOptions: kakao.maps.CustomOverlayOptions = {
    position: overlayPosition,
    content,
    map: options.map,
    zIndex: options.zIndex,
    clickable: options.clickable ?? false,
    yAnchor: options.yAnchor,
  };

  // 오버레이 생성 및 반환
  const overlay = new kakao.maps.CustomOverlay(overlayOptions);

  return overlay;
}
