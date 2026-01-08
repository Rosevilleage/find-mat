/**
 * Unit tests for marker-manager utilities
 *
 * Tests the Kakao Map marker creation and management functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMarker,
  updateMarkerStyle,
  addMarkerClickEvent,
} from '@/shared/lib/kakao-map/marker-manager';

describe('marker-manager', () => {
  let mockMap: any;
  let mockMarker: any;
  let mockMarkerImage: any;

  beforeEach(() => {
    // Create mock map instance
    mockMap = {
      setCenter: vi.fn(),
      getCenter: vi.fn(),
      setLevel: vi.fn(),
      getLevel: vi.fn(),
      panTo: vi.fn(),
    };

    // Create mock marker instance
    mockMarker = {
      setMap: vi.fn(),
      getMap: vi.fn(() => mockMap),
      setPosition: vi.fn(),
      getPosition: vi.fn(),
      setImage: vi.fn(),
      setZIndex: vi.fn(),
      setTitle: vi.fn(),
    };

    // Create mock marker image
    mockMarkerImage = {
      _brand: 'MarkerImage',
    };

    // Mock kakao.maps.Marker constructor
    vi.mocked(kakao.maps.Marker).mockImplementation(function () {
      return mockMarker;
    } as any);

    // Mock kakao.maps.MarkerImage constructor
    vi.mocked(kakao.maps.MarkerImage).mockImplementation(function () {
      return mockMarkerImage;
    } as any);

    // Mock kakao.maps.Size constructor
    vi.mocked(kakao.maps.Size).mockImplementation(function (width: number, height: number) {
      return { width, height } as any;
    } as any);

    // Mock kakao.maps.LatLng constructor
    vi.mocked(kakao.maps.LatLng).mockImplementation(function (lat: number, lng: number) {
      return {
        getLat: () => lat,
        getLng: () => lng,
      } as any;
    } as any);
  });

  describe('createMarker', () => {
    it('should create a marker with position and map', () => {
      const position = { lat: 37.5665, lng: 126.978 };
      const options = { map: mockMap };

      const marker = createMarker(position, options);

      expect(kakao.maps.LatLng).toHaveBeenCalledWith(position.lat, position.lng);
      expect(kakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          map: mockMap,
        })
      );
      expect(marker).toBe(mockMarker);
    });

    it('should create a marker without map', () => {
      const position = { lat: 37.5665, lng: 126.978 };

      const marker = createMarker(position);

      expect(marker).toBe(mockMarker);
      expect(kakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          map: undefined,
        })
      );
    });

    it('should create a marker with custom image', () => {
      const position = { lat: 37.5665, lng: 126.978 };
      const options = {
        imageSrc: '/marker-icon.png',
        imageSize: { width: 24, height: 24 },
      };

      createMarker(position, options);

      expect(kakao.maps.Size).toHaveBeenCalledWith(24, 24);
      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        '/marker-icon.png',
        expect.anything(),
        undefined
      );
    });

    it('should create a marker with title', () => {
      const position = { lat: 37.5665, lng: 126.978 };
      const options = { title: 'Test Restaurant' };

      createMarker(position, options);

      expect(kakao.maps.Marker).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Restaurant',
        })
      );
    });

    it('should throw error if position is invalid', () => {
      expect(() => {
        createMarker({ lat: NaN, lng: 126.978 });
      }).toThrow('Invalid position coordinates');

      expect(() => {
        createMarker({ lat: 37.5665, lng: NaN });
      }).toThrow('Invalid position coordinates');

      expect(() => {
        createMarker(null as any);
      }).toThrow('Position is required');
    });
  });

  describe('updateMarkerStyle', () => {
    it('should update marker style when selected', () => {
      const options = {
        selectedImageSrc: '/marker-selected.png',
        normalImageSrc: '/marker-normal.png',
        imageSize: { width: 24, height: 24 },
      };

      updateMarkerStyle(mockMarker, true, options);

      expect(kakao.maps.Size).toHaveBeenCalledWith(24, 24);
      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        '/marker-selected.png',
        expect.anything(),
        undefined
      );
      expect(mockMarker.setImage).toHaveBeenCalledWith(mockMarkerImage);
      expect(mockMarker.setZIndex).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should update marker style when not selected', () => {
      const options = {
        selectedImageSrc: '/marker-selected.png',
        normalImageSrc: '/marker-normal.png',
        imageSize: { width: 24, height: 24 },
      };

      updateMarkerStyle(mockMarker, false, options);

      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        '/marker-normal.png',
        expect.anything(),
        undefined
      );
      expect(mockMarker.setImage).toHaveBeenCalledWith(mockMarkerImage);
    });

    it('should throw error if marker is null', () => {
      expect(() => {
        updateMarkerStyle(null as any, true, {
          selectedImageSrc: '/selected.png',
          normalImageSrc: '/normal.png',
          imageSize: { width: 24, height: 24 },
        });
      }).toThrow('Marker instance is required');
    });

    it('should use higher z-index for selected markers', () => {
      const options = {
        selectedImageSrc: '/marker-selected.png',
        normalImageSrc: '/marker-normal.png',
        imageSize: { width: 24, height: 24 },
      };

      updateMarkerStyle(mockMarker, true, options);
      const selectedZIndex = mockMarker.setZIndex.mock.calls[0][0];

      mockMarker.setZIndex.mockClear();

      updateMarkerStyle(mockMarker, false, options);
      const normalZIndex = mockMarker.setZIndex.mock.calls[0][0];

      expect(selectedZIndex).toBeGreaterThan(normalZIndex);
    });
  });

  describe('addMarkerClickEvent', () => {
    it('should add click event listener to marker', () => {
      const callback = vi.fn();

      addMarkerClickEvent(mockMarker, callback);

      expect(kakao.maps.event.addListener).toHaveBeenCalledWith(
        mockMarker,
        'click',
        callback
      );
    });

    it('should throw error if marker is null', () => {
      const callback = vi.fn();

      expect(() => {
        addMarkerClickEvent(null as any, callback);
      }).toThrow('Marker instance is required');
    });

    it('should throw error if callback is not a function', () => {
      expect(() => {
        addMarkerClickEvent(mockMarker, null as any);
      }).toThrow('Callback must be a function');
    });

    it('should execute callback when marker is clicked', () => {
      const callback = vi.fn();
      let clickHandler: (() => void) | undefined;

      // Capture the click handler
      vi.mocked(kakao.maps.event.addListener).mockImplementation(
        (target, type, handler) => {
          if (type === 'click') {
            clickHandler = handler as () => void;
          }
        }
      );

      addMarkerClickEvent(mockMarker, callback);

      // Simulate click
      expect(clickHandler).toBeDefined();
      clickHandler!();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateMarkerStyle with MARKER_CONFIG', () => {
    it('should work with MARKER_CONFIG settings', async () => {
      // Import는 동적으로 수행
      const { MARKER_CONFIG } = await import('@/shared/config');

      updateMarkerStyle(mockMarker, true, {
        selectedImageSrc: MARKER_CONFIG.selected.src,
        normalImageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      expect(kakao.maps.Size).toHaveBeenCalledWith(
        MARKER_CONFIG.size.width,
        MARKER_CONFIG.size.height
      );
      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        MARKER_CONFIG.selected.src,
        expect.anything(),
        undefined
      );
      expect(mockMarker.setImage).toHaveBeenCalled();
      expect(mockMarker.setZIndex).toHaveBeenCalledWith(100);
    });

    it('should use correct image paths from MARKER_CONFIG', async () => {
      const { MARKER_CONFIG } = await import('@/shared/config');

      // 선택 상태
      updateMarkerStyle(mockMarker, true, {
        selectedImageSrc: MARKER_CONFIG.selected.src,
        normalImageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        '/images/markers/marker-selected.svg',
        expect.anything(),
        undefined
      );

      vi.mocked(kakao.maps.MarkerImage).mockClear();

      // 일반 상태
      updateMarkerStyle(mockMarker, false, {
        selectedImageSrc: MARKER_CONFIG.selected.src,
        normalImageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      expect(kakao.maps.MarkerImage).toHaveBeenCalledWith(
        '/images/markers/marker-normal.svg',
        expect.anything(),
        undefined
      );
    });

    it('should use correct marker size (48x68)', async () => {
      const { MARKER_CONFIG } = await import('@/shared/config');

      expect(MARKER_CONFIG.size.width).toBe(48);
      expect(MARKER_CONFIG.size.height).toBe(68);

      updateMarkerStyle(mockMarker, true, {
        selectedImageSrc: MARKER_CONFIG.selected.src,
        normalImageSrc: MARKER_CONFIG.normal.src,
        imageSize: MARKER_CONFIG.size,
      });

      expect(kakao.maps.Size).toHaveBeenCalledWith(48, 68);
    });
  });
});
