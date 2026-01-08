/**
 * Integration tests for useMapMarkers hook
 *
 * Tests the marker creation and custom image integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMapMarkers, type MapRestaurant } from './useMapMarkers';
import { MARKER_CONFIG } from '@/shared/config';
import * as markerManager from '@/shared/lib/kakao-map/marker-manager';

describe('useMapMarkers with custom images', () => {
  let mockMap: kakao.maps.Map;
  let mockMarker: kakao.maps.Marker;
  let restaurants: MapRestaurant[];

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock map instance
    mockMap = {
      setCenter: vi.fn(),
      getCenter: vi.fn(),
    };

    // Mock marker instance
    mockMarker = {
      setMap: vi.fn(),
      setImage: vi.fn(),
      setZIndex: vi.fn(),
      getPosition: vi.fn(),
    };

    // Mock kakao.maps.Marker constructor
    vi.mocked(kakao.maps.Marker).mockImplementation(
      () => mockMarker as kakao.maps.Marker
    );

    // Mock kakao.maps.LatLng
    vi.mocked(kakao.maps.LatLng).mockImplementation(
      (lat: number, lng: number) => ({ lat, lng } as kakao.maps.LatLng)
    );

    // Mock createMarker to return our mock marker
    vi.spyOn(markerManager, 'createMarker').mockReturnValue(mockMarker);

    // Mock updateMarkerStyle
    vi.spyOn(markerManager, 'updateMarkerStyle').mockImplementation(() => {});

    // Test data
    restaurants = [
      { id: '1', name: 'Restaurant 1', lat: 37.5, lng: 127.0 },
      { id: '2', name: 'Restaurant 2', lat: 37.6, lng: 127.1 },
    ];
  });

  describe('마커 스타일 업데이트', () => {
    it('selectedId 변경 시 updateMarkerStyle을 호출해야 함', () => {
      const { rerender } = renderHook(
        ({ selectedId }) =>
          useMapMarkers({
            map: mockMap,
            restaurants,
            selectedId,
          }),
        { initialProps: { selectedId: undefined as string | undefined } }
      );

      // 초기 렌더링에서 마커가 생성되고 스타일이 적용됨
      const initialCalls = vi.mocked(markerManager.updateMarkerStyle).mock
        .calls.length;
      expect(initialCalls).toBeGreaterThan(0);

      // mock 초기화
      vi.mocked(markerManager.updateMarkerStyle).mockClear();

      // selectedId 변경
      rerender({ selectedId: '1' });

      // updateMarkerStyle이 다시 호출되어야 함
      expect(markerManager.updateMarkerStyle).toHaveBeenCalled();
    });

    it('MARKER_CONFIG를 사용하여 마커 스타일을 업데이트해야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: '1',
        })
      );

      // updateMarkerStyle이 MARKER_CONFIG 옵션으로 호출되어야 함
      expect(markerManager.updateMarkerStyle).toHaveBeenCalledWith(
        mockMarker,
        true, // isSelected
        expect.objectContaining({
          selectedImageSrc: MARKER_CONFIG.selected.src,
          normalImageSrc: MARKER_CONFIG.normal.src,
          imageSize: MARKER_CONFIG.size,
        })
      );
    });

    it('선택되지 않은 마커는 일반 스타일을 사용해야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: '1', // 첫 번째만 선택
        })
      );

      // updateMarkerStyle이 두 번 호출됨 (두 개의 마커)
      const calls = vi.mocked(markerManager.updateMarkerStyle).mock.calls;
      expect(calls.length).toBe(2);

      // 하나는 선택 상태 (true), 하나는 일반 상태 (false)
      const selectedCalls = calls.filter((call) => call[1] === true);
      const normalCalls = calls.filter((call) => call[1] === false);

      expect(selectedCalls.length).toBe(1);
      expect(normalCalls.length).toBe(1);
    });

    it('selectedId가 없으면 모든 마커가 일반 스타일이어야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: undefined,
        })
      );

      const calls = vi.mocked(markerManager.updateMarkerStyle).mock.calls;

      // 모든 호출이 isSelected = false 여야 함
      const allNormal = calls.every((call) => call[1] === false);
      expect(allNormal).toBe(true);
    });

    it('map이 null이면 스타일 업데이트를 하지 않아야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: null,
          restaurants,
          selectedId: '1',
        })
      );

      // updateMarkerStyle이 호출되지 않아야 함
      expect(markerManager.updateMarkerStyle).not.toHaveBeenCalled();
    });
  });

  describe('마커 이미지 크기', () => {
    it('MARKER_CONFIG의 크기(48x68)를 사용해야 함', () => {
      expect(MARKER_CONFIG.size.width).toBe(48);
      expect(MARKER_CONFIG.size.height).toBe(68);

      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: '1',
        })
      );

      expect(markerManager.updateMarkerStyle).toHaveBeenCalledWith(
        mockMarker,
        expect.any(Boolean),
        expect.objectContaining({
          imageSize: { width: 48, height: 68 },
        })
      );
    });
  });

  describe('마커 경로', () => {
    it('올바른 SVG 경로를 사용해야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: '1',
        })
      );

      expect(markerManager.updateMarkerStyle).toHaveBeenCalledWith(
        mockMarker,
        expect.any(Boolean),
        expect.objectContaining({
          selectedImageSrc: '/images/markers/marker-selected.svg',
          normalImageSrc: '/images/markers/marker-normal.svg',
        })
      );
    });
  });
});
