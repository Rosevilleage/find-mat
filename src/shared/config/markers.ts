/**
 * 카카오 맵 마커 이미지 설정
 *
 * 커스텀 마커 이미지의 경로와 크기를 중앙에서 관리합니다.
 *
 * @module shared/config/markers
 */

/**
 * 마커 설정
 *
 * @example
 * ```typescript
 * import { MARKER_CONFIG } from '@/shared/config';
 *
 * // 일반 마커 이미지 사용
 * const normalImage = MARKER_CONFIG.normal.src;
 *
 * // 선택된 마커 이미지 사용
 * const selectedImage = MARKER_CONFIG.selected.src;
 *
 * // 마커 크기
 * const size = MARKER_CONFIG.size;
 * ```
 */
export const MARKER_CONFIG = {
  /** 일반 상태 마커 설정 */
  normal: {
    /** 일반 마커 이미지 경로 */
    src: '/images/markers/marker-normal.svg',
  },
  /** 선택 상태 마커 설정 */
  selected: {
    /** 선택된 마커 이미지 경로 */
    src: '/images/markers/marker-selected.svg',
  },
  /** 마커 이미지 크기 (픽셀) */
  size: {
    /** 마커 너비 */
    width: 48,
    /** 마커 높이 */
    height: 68,
  },
} as const;

/**
 * 마커 설정 타입
 */
export type MarkerConfig = typeof MARKER_CONFIG;
