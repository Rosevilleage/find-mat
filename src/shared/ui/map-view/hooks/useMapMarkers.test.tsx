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
      setLevel: vi.fn(),
      getLevel: vi.fn(),
      panTo: vi.fn(),
    } as unknown as kakao.maps.Map;

    // Mock marker instance
    mockMarker = {
      setMap: vi.fn(),
      getMap: vi.fn(),
      setImage: vi.fn(),
      setZIndex: vi.fn(),
      getPosition: vi.fn(),
      setPosition: vi.fn(),
      setTitle: vi.fn(),
    } as unknown as kakao.maps.Marker;

    // Mock kakao.maps.Marker constructor
    vi.mocked(kakao.maps.Marker).mockImplementation(
      () => mockMarker as kakao.maps.Marker
    );

    // Mock kakao.maps.LatLng
    vi.mocked(kakao.maps.LatLng).mockImplementation(
      (lat: number, lng: number) =>
        ({ lat, lng } as unknown as kakao.maps.LatLng)
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

  describe('엣지 케이스', () => {
    it('빈 레스토랑 배열이어도 에러가 발생하지 않아야 함', () => {
      expect(() => {
        renderHook(() =>
          useMapMarkers({
            map: mockMap,
            restaurants: [],
            selectedId: undefined,
          })
        );
      }).not.toThrow();

      // updateMarkerStyle이 호출되지 않아야 함
      expect(markerManager.updateMarkerStyle).not.toHaveBeenCalled();
    });

    it('레스토랑이 추가되면 마커를 생성해야 함', () => {
      const { rerender } = renderHook(
        ({ restaurants: r }) =>
          useMapMarkers({
            map: mockMap,
            restaurants: r,
            selectedId: undefined,
          }),
        { initialProps: { restaurants: [] as MapRestaurant[] } }
      );

      // 초기에는 마커 없음
      expect(markerManager.createMarker).not.toHaveBeenCalled();

      // 레스토랑 추가
      rerender({ restaurants });

      // 마커가 생성되어야 함
      expect(markerManager.createMarker).toHaveBeenCalledTimes(2);
    });

    it('지도와 selectedId가 동시에 변경되어도 정상 작동해야 함', () => {
      const newMockMap = {
        setCenter: vi.fn(),
        getCenter: vi.fn(),
      } as unknown as kakao.maps.Map;

      const { rerender } = renderHook(
        ({ map, selectedId }) =>
          useMapMarkers({
            map,
            restaurants,
            selectedId,
          }),
        { initialProps: { map: mockMap, selectedId: undefined as string | undefined } }
      );

      vi.clearAllMocks();

      // 지도와 selectedId 동시 변경
      rerender({ map: newMockMap, selectedId: '1' });

      // 정상적으로 처리되어야 함 (에러 없음)
      expect(() => rerender({ map: newMockMap, selectedId: '1' })).not.toThrow();
    });

    it('유효하지 않은 selectedId는 무시되어야 함', () => {
      renderHook(() =>
        useMapMarkers({
          map: mockMap,
          restaurants,
          selectedId: 'non-existent-id',
        })
      );

      // 모든 마커가 일반 스타일이어야 함
      const calls = vi.mocked(markerManager.updateMarkerStyle).mock.calls;
      const allNormal = calls.every((call) => call[1] === false);
      expect(allNormal).toBe(true);
    });

    it('대량의 레스토랑 (100개)도 처리할 수 있어야 함', () => {
      const manyRestaurants: MapRestaurant[] = Array.from({ length: 100 }, (_, i) => ({
        id: `restaurant-${i}`,
        name: `Restaurant ${i}`,
        lat: 37.5 + i * 0.01,
        lng: 127.0 + i * 0.01,
      }));

      expect(() => {
        renderHook(() =>
          useMapMarkers({
            map: mockMap,
            restaurants: manyRestaurants,
            selectedId: 'restaurant-50',
          })
        );
      }).not.toThrow();

      // 100개의 마커가 생성되어야 함
      expect(markerManager.createMarker).toHaveBeenCalledTimes(100);

      // updateMarkerStyle이 100번 호출되어야 함
      expect(markerManager.updateMarkerStyle).toHaveBeenCalledTimes(100);
    });

    it('restaurants prop이 변경되면 기존 마커를 제거하고 새로 생성해야 함', () => {
      const { rerender } = renderHook(
        ({ restaurants: r }) =>
          useMapMarkers({
            map: mockMap,
            restaurants: r,
            selectedId: undefined,
          }),
        { initialProps: { restaurants } }
      );

      // 초기 마커 생성 확인
      expect(markerManager.createMarker).toHaveBeenCalledTimes(2);

      vi.clearAllMocks();

      // 다른 레스토랑으로 변경
      const newRestaurants: MapRestaurant[] = [
        { id: '3', name: 'Restaurant 3', lat: 37.7, lng: 127.2 },
      ];
      rerender({ restaurants: newRestaurants });

      // 기존 마커 제거 (setMap(null) 호출됨)
      expect(mockMarker.setMap).toHaveBeenCalled();
      const setMapCalls = vi.mocked(mockMarker.setMap).mock.calls;
      // null이 포함되어 있어야 함 (마커 제거)
      const hasNullCall = setMapCalls.some(
        (call: [kakao.maps.Map | null]) => call[0] === null
      );
      expect(hasNullCall).toBe(true);

      // 새 마커 생성
      expect(markerManager.createMarker).toHaveBeenCalledTimes(1);
    });
  });
});
