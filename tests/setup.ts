/**
 * Vitest global setup file
 *
 * This file runs before all tests to set up the test environment.
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock map instance
const mockMapInstance = {
  setCenter: vi.fn(),
  setLevel: vi.fn(),
  getCenter: vi.fn(() => ({
    getLat: () => 37.5665,
    getLng: () => 126.978,
  })),
  getLevel: vi.fn(() => 3),
};

// Mock Kakao Map SDK globally
globalThis.kakao = {
  maps: {
    load: vi.fn((callback: () => void) => callback()),
    Map: vi.fn(function () {
      return mockMapInstance;
    }) as any,
    LatLng: vi.fn(function (lat: number, lng: number) {
      return {
        getLat: () => lat,
        getLng: () => lng,
      };
    }) as any,
    Marker: vi.fn(function () {
      return {
        setMap: vi.fn(),
        setImage: vi.fn(),
        setZIndex: vi.fn(),
        getPosition: vi.fn(),
      };
    }) as any,
    MarkerImage: vi.fn(function () {
      return { _brand: 'MarkerImage' };
    }) as any,
    Size: vi.fn(function (width: number, height: number) {
      return { width, height };
    }) as any,
    event: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

// Make SDK appear as loaded in window
(globalThis as any).window = globalThis;
(globalThis.window as any).kakao = globalThis.kakao;
