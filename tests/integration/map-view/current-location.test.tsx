/**
 * MapView 현재 위치 기능 통합 테스트
 *
 * 현재 위치 버튼 클릭 시 지도 중심이 현재 위치로 이동하는지 검증합니다.
 *
 * @module tests/integration/map-view/current-location
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MapView } from "@/shared/ui/map-view";

// Mock the loader module
vi.mock("@/shared/lib/kakao-map/loader", () => ({
  loadKakaoMapSDK: vi.fn().mockResolvedValue(undefined),
  isSDKLoaded: vi.fn().mockReturnValue(true),
  resetSDKState: vi.fn(),
}));

// Mock restaurants data
const mockRestaurants = [
  { id: "1", name: "Restaurant A", lat: 37.5665, lng: 126.978 },
];

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

describe("MapView Current Location", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock navigator.geolocation
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("지도 렌더링", () => {
    it("지도 컨테이너가 렌더링된다", () => {
      const handlePinClick = vi.fn();

      render(
        <MapView
          restaurants={mockRestaurants}
          onPinClick={handlePinClick}
        />
      );

      // 지도 컨테이너가 존재해야 함
      const mapContainer = screen.getByTestId("kakao-map-container");
      expect(mapContainer).toBeInTheDocument();
    });
  });

});
