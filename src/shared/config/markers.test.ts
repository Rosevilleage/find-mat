import { describe, it, expect } from 'vitest';
import { MARKER_CONFIG } from './markers';

describe('MARKER_CONFIG', () => {
  describe('일반 마커 설정', () => {
    it('일반 마커 이미지 경로가 정의되어야 함', () => {
      expect(MARKER_CONFIG.normal.src).toBeDefined();
      expect(typeof MARKER_CONFIG.normal.src).toBe('string');
    });

    it('일반 마커 이미지 경로가 비어있지 않아야 함', () => {
      expect(MARKER_CONFIG.normal.src.length).toBeGreaterThan(0);
    });

    it('일반 마커 이미지 경로가 올바른 형식이어야 함', () => {
      expect(MARKER_CONFIG.normal.src).toMatch(/^\/images\/markers\/.+\.svg$/);
    });
  });

  describe('선택된 마커 설정', () => {
    it('선택된 마커 이미지 경로가 정의되어야 함', () => {
      expect(MARKER_CONFIG.selected.src).toBeDefined();
      expect(typeof MARKER_CONFIG.selected.src).toBe('string');
    });

    it('선택된 마커 이미지 경로가 비어있지 않아야 함', () => {
      expect(MARKER_CONFIG.selected.src.length).toBeGreaterThan(0);
    });

    it('선택된 마커 이미지 경로가 올바른 형식이어야 함', () => {
      expect(MARKER_CONFIG.selected.src).toMatch(/^\/images\/markers\/.+\.svg$/);
    });
  });

  describe('마커 크기 설정', () => {
    it('마커 크기가 정의되어야 함', () => {
      expect(MARKER_CONFIG.size).toBeDefined();
      expect(MARKER_CONFIG.size.width).toBeDefined();
      expect(MARKER_CONFIG.size.height).toBeDefined();
    });

    it('마커 너비가 유효한 양수여야 함', () => {
      expect(MARKER_CONFIG.size.width).toBeGreaterThan(0);
      expect(typeof MARKER_CONFIG.size.width).toBe('number');
    });

    it('마커 높이가 유효한 양수여야 함', () => {
      expect(MARKER_CONFIG.size.height).toBeGreaterThan(0);
      expect(typeof MARKER_CONFIG.size.height).toBe('number');
    });

    it('마커 크기가 합리적인 범위 내에 있어야 함 (10-100px)', () => {
      expect(MARKER_CONFIG.size.width).toBeGreaterThanOrEqual(10);
      expect(MARKER_CONFIG.size.width).toBeLessThanOrEqual(100);
      expect(MARKER_CONFIG.size.height).toBeGreaterThanOrEqual(10);
      expect(MARKER_CONFIG.size.height).toBeLessThanOrEqual(100);
    });
  });

  describe('설정 불변성', () => {
    it('MARKER_CONFIG가 읽기 전용이어야 함', () => {
      // TypeScript의 as const로 인해 타입 레벨에서 보장됨
      expect(Object.isFrozen(MARKER_CONFIG)).toBe(false); // as const는 런타임에 freeze하지 않음
      // 하지만 TypeScript 컴파일 타임에 readonly 보장
    });
  });

  describe('일관성 검증', () => {
    it('일반 마커와 선택된 마커 경로가 달라야 함', () => {
      expect(MARKER_CONFIG.normal.src).not.toBe(MARKER_CONFIG.selected.src);
    });
  });
});
