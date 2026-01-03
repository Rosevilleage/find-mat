/**
 * Unit tests for map-manager utilities
 *
 * Tests the Kakao Map initialization and management functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMap, setCenter, setLevel } from '@/shared/lib/kakao-map/map-manager';

describe('map-manager', () => {
  let container: HTMLElement;
  let mockMap: any;

  beforeEach(() => {
    // Create a mock container element
    container = document.createElement('div');
    container.id = 'map-container';
    document.body.appendChild(container);

    // Create a mock map instance
    mockMap = {
      setCenter: vi.fn(),
      getCenter: vi.fn(),
      setLevel: vi.fn(),
      getLevel: vi.fn(() => 3),
      panTo: vi.fn(),
    };

    // Mock kakao.maps.Map constructor
    vi.mocked(kakao.maps.Map).mockImplementation(function () {
      return mockMap;
    } as any);

    // Mock kakao.maps.LatLng constructor
    vi.mocked(kakao.maps.LatLng).mockImplementation(function (lat: number, lng: number) {
      return {
        getLat: () => lat,
        getLng: () => lng,
      } as any;
    } as any);
  });

  describe('createMap', () => {
    it('should create a map with correct options', () => {
      const options = {
        center: { lat: 37.5665, lng: 126.978 },
        level: 3,
      };

      const map = createMap(container, options);

      expect(kakao.maps.Map).toHaveBeenCalledTimes(1);
      expect(kakao.maps.Map).toHaveBeenCalledWith(
        container,
        expect.objectContaining({
          level: 3,
        })
      );
      expect(map).toBe(mockMap);
    });

    it('should create a map with default level if not provided', () => {
      const options = {
        center: { lat: 37.5665, lng: 126.978 },
      };

      createMap(container, options);

      expect(kakao.maps.Map).toHaveBeenCalledWith(
        container,
        expect.objectContaining({
          level: expect.any(Number),
        })
      );
    });

    it('should throw error if container is null', () => {
      const options = {
        center: { lat: 37.5665, lng: 126.978 },
      };

      expect(() => {
        createMap(null as any, options);
      }).toThrow('Map container element is required');
    });

    it('should throw error if container is not an HTMLElement', () => {
      const options = {
        center: { lat: 37.5665, lng: 126.978 },
      };

      expect(() => {
        createMap({} as any, options);
      }).toThrow('Map container must be an HTMLElement');
    });

    it('should create LatLng with provided coordinates', () => {
      const options = {
        center: { lat: 37.5665, lng: 126.978 },
        level: 3,
      };

      createMap(container, options);

      expect(kakao.maps.LatLng).toHaveBeenCalledWith(37.5665, 126.978);
    });
  });

  describe('setCenter', () => {
    beforeEach(() => {
      // Reset the mock before each test
      mockMap.setCenter.mockClear();
    });

    it('should set map center with LatLng coordinates', () => {
      const lat = 37.5665;
      const lng = 126.978;

      setCenter(mockMap, lat, lng);

      expect(kakao.maps.LatLng).toHaveBeenCalledWith(lat, lng);
      expect(mockMap.setCenter).toHaveBeenCalledTimes(1);
    });

    it('should throw error if map is null', () => {
      expect(() => {
        setCenter(null as any, 37.5665, 126.978);
      }).toThrow('Map instance is required');
    });

    it('should throw error if coordinates are invalid', () => {
      expect(() => {
        setCenter(mockMap, NaN, 126.978);
      }).toThrow('Invalid coordinates');

      expect(() => {
        setCenter(mockMap, 37.5665, NaN);
      }).toThrow('Invalid coordinates');
    });
  });

  describe('setLevel', () => {
    beforeEach(() => {
      mockMap.setLevel.mockClear();
    });

    it('should set map zoom level', () => {
      const level = 5;

      setLevel(mockMap, level);

      expect(mockMap.setLevel).toHaveBeenCalledWith(level, undefined);
    });

    it('should set map zoom level with animation options', () => {
      const level = 5;
      const options = { animate: true };

      setLevel(mockMap, level, options);

      expect(mockMap.setLevel).toHaveBeenCalledWith(level, options);
    });

    it('should throw error if map is null', () => {
      expect(() => {
        setLevel(null as any, 5);
      }).toThrow('Map instance is required');
    });

    it('should throw error if level is invalid', () => {
      expect(() => {
        setLevel(mockMap, -1);
      }).toThrow('Zoom level must be between 1 and 14');

      expect(() => {
        setLevel(mockMap, 15);
      }).toThrow('Zoom level must be between 1 and 14');

      expect(() => {
        setLevel(mockMap, NaN);
      }).toThrow('Zoom level must be between 1 and 14');
    });
  });
});
