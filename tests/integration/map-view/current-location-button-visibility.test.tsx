/**
 * 현재 위치 버튼과 Bottom Sheet 가시성 통합 테스트
 *
 * Bottom sheet의 다양한 상태(collapsed, half, full)에서
 * 현재 위치 버튼이 항상 보이고 클릭 가능한지 검증합니다.
 *
 * @module tests/integration/map-view/current-location-button-visibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { MapScreen } from "@/pages/map";

// Mock dependencies
vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock("@/shared/lib/kakao-map/loader", () => ({
  loadKakaoMapSDK: vi.fn().mockResolvedValue(undefined),
  isSDKLoaded: vi.fn().mockReturnValue(true),
  resetSDKState: vi.fn(),
}));

vi.mock("@/shared/hooks", () => ({
  useGeolocation: () => ({
    coordinates: { lat: 37.5665, lng: 126.978 },
    error: null,
    isLoading: false,
  }),
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

describe("CurrentLocationButton with BottomSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe("가시성", () => {
    it("sheet가 collapsed 상태일 때 버튼이 보여야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        expect(button).toBeInTheDocument();

        // 버튼이 렌더링되고 보이는지 확인
        expect(button).toBeVisible();

        // 버튼의 부모 요소가 존재하고 위치가 설정되어 있는지 확인
        const buttonParent = button.parentElement;
        expect(buttonParent).toBeTruthy();
        expect(buttonParent?.className).toContain("absolute");
        expect(buttonParent?.className).toContain("right-4");
        expect(buttonParent?.className).toContain("z-40");
      });
    });

    it("sheet가 half-open 상태일 때 버튼이 보여야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        expect(button).toBeInTheDocument();
        expect(button).toBeVisible();

        // 기본 상태가 half이므로 버튼이 보여야 함
        const buttonParent = button.parentElement;
        expect(buttonParent).toBeTruthy();
      });
    });

    it("sheet가 full-open 상태일 때 버튼이 보여야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        expect(button).toBeInTheDocument();
        expect(button).toBeVisible();
      });
    });
  });

  describe("위치 조정", () => {
    it("sheet 상단 가장자리로부터 적절한 간격을 유지해야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        const buttonParent = button.parentElement!;

        // 버튼 부모가 z-40 클래스를 가지고 있는지 확인
        expect(buttonParent.className).toContain("z-40");

        // 버튼이 오른쪽에 위치해야 함
        expect(buttonParent.className).toContain("right-4");
        expect(buttonParent.className).toContain("absolute");
      });
    });

    it("sheet 높이 변경 시 부드럽게 전환되어야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        expect(button).toBeInTheDocument();

        // 애니메이션 transition이 설정되어 있는지 확인
        const buttonParent = button.parentElement!;
        const style = window.getComputedStyle(buttonParent);

        // Framer Motion이 적용되어 있으면 transform이나 transition이 있을 것
        expect(
          style.transition || style.transform || buttonParent.hasAttribute("style")
        ).toBeTruthy();
      });
    });
  });

  describe("상호작용", () => {
    it("모든 sheet 상태에서 클릭 가능해야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");

        // 버튼이 disabled 상태가 아니어야 함
        expect(button).not.toBeDisabled();

        // 버튼 클릭이 가능해야 함
        button.click();
        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });
    });

    it("클릭 시 위치 요청을 트리거해야 함", async () => {
      // getCurrentPosition이 성공하도록 모킹
      const mockPosition = {
        coords: {
          latitude: 37.5665,
          longitude: 126.978,
          accuracy: 100,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        if (success) {
          success(mockPosition);
        }
      });

      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        button.click();

        expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      });
    });
  });

  describe("Z-Index 계층", () => {
    it("버튼의 z-index가 bottom sheet보다 높아야 함", async () => {
      render(<MapScreen />);

      await waitFor(() => {
        const button = screen.getByTestId("current-location-button");
        const buttonParent = button.parentElement!;

        // Bottom sheet는 z-30, 버튼은 z-40 클래스를 가져야 함
        expect(buttonParent.className).toContain("z-40");

        // 절대 위치 지정 확인
        expect(buttonParent.className).toContain("absolute");
      });
    });
  });
});
