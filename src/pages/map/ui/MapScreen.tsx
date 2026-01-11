import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { usePlacesSearchQuery } from "@/features/search-food-places";
import { MapView, useCurrentLocation } from "@/shared/ui/map-view";
import { MOCK_RESTAURANTS } from "@/entities/restaurant";
import { RestaurantDetail } from "@/widgets/restaurant-detail";
import type { Restaurant } from "@/entities/restaurant";
import {
  IconMapPinOff,
  IconSettings,
  IconChevronLeft,
} from "@tabler/icons-react";
import { Button } from "@/shared/ui/kit/button";
import { CATEGORIES } from "@/shared/config";
import { useGeolocation } from "@/shared/hooks";
import { MapHeader } from "./MapHeader";
import { RestaurantSheet } from "./RestaurantSheet";
import { useMapData } from "../lib/useMapData";

interface MapScreenProps {
  hasLocationPermission?: boolean;
  onRequestPermission?: () => void;
  onShowToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export function MapScreen({
  hasLocationPermission = true,
  onRequestPermission,
  onShowToast,
}: MapScreenProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 사용자 위치 가져오기 (실패 시 서울 기본 좌표 사용)
  const { coordinates: userLocation, error: geoError } = useGeolocation();

  // 토스트 표시 여부 추적 (한 번만 표시하기 위함)
  const hasShownToast = React.useRef(false);

  // 위치 권한 상태 확인 및 사용자에게 알림 (한 번만)
  React.useEffect(() => {
    if (geoError && !hasShownToast.current) {
      console.warn("📍 위치 정보:", geoError);

      // 사용자에게 위치 권한 에러 표시
      if (onShowToast) {
        if (geoError.includes("거부")) {
          onShowToast(
            "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.",
            "error"
          );
        } else if (geoError.includes("사용할 수 없습니다")) {
          // POSITION_UNAVAILABLE 에러 - 시스템 위치 서비스 비활성화
          onShowToast(
            "시스템 위치 서비스가 비활성화되어 있습니다. 시스템 설정에서 위치 서비스를 활성화해주세요.",
            "error"
          );
        } else {
          onShowToast(geoError, "error");
        }
        hasShownToast.current = true;
      }
    }
  }, [geoError, onShowToast]);

  // 위치 권한 상태 확인 (Permissions API 사용)
  React.useEffect(() => {
    let hasShownPermissionToast = false;

    const checkPermission = async () => {
      try {
        // Permissions API가 지원되는지 확인
        if (!navigator.permissions) {
          console.warn("⚠️ Permissions API가 지원되지 않습니다.");
          return;
        }

        const result = await navigator.permissions.query({
          name: "geolocation",
        });

        console.log("🔐 위치 권한 상태:", result.state);

        // 권한 상태가 변경될 때마다 로그 (토스트는 한 번만)
        result.addEventListener("change", () => {
          console.log("🔐 위치 권한 상태 변경:", result.state);

          if (
            result.state === "granted" &&
            onShowToast &&
            !hasShownPermissionToast
          ) {
            hasShownPermissionToast = true;
            onShowToast("위치 권한이 허용되었습니다.", "success");
            // 페이지 새로고침으로 위치 다시 가져오기
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      } catch (error) {
        console.warn("⚠️ 위치 권한 확인 실패:", error);
      }
    };

    checkPermission();
  }, [onShowToast]);

  // URL에서 검색된 음식 읽기
  const searchedFood = searchParams.get("food");

  // Places API로 음식점 검색 (URL에 food 파라미터가 있을 때만)
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = usePlacesSearchQuery({
    keyword: searchedFood || "",
    location: userLocation ?? undefined,
    radius: 5000, // 5km 반경
    enabled: !!searchedFood, // food 파라미터가 있을 때만 검색 실행
  });

  // 검색 결과 추출 (useMemo로 래핑하여 불필요한 재계산 방지)
  const searchResults = useMemo(() => {
    return searchData?.results || [];
  }, [searchData]);

  // 로컬 상태 관리
  const [restaurants, setRestaurants] =
    useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [sheetHeight, setSheetHeight] = useState<"collapsed" | "half" | "full">(
    "half"
  );
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // 현재 위치 기능
  const locationState = useCurrentLocation({
    map: mapInstance,
  });

  // 레스토랑 데이터 필터링 및 마커 생성
  const { filteredRestaurants, searchedRestaurants, mapMarkers } = useMapData({
    restaurants,
    searchedFood,
    searchResults,
    selectedCategory,
  });

  // 핸들러 함수들
  const handlePinClick = (restaurant: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  }) => {
    console.log("🖱️ 마커 클릭:", restaurant);

    // Places API 검색 결과인 경우
    if (searchedFood && searchedRestaurants.length > 0) {
      const foundRestaurant = searchedRestaurants.find(
        (r) => r.id === restaurant.id
      );
      if (foundRestaurant) {
        console.log("✅ Places API 음식점 발견:", foundRestaurant);
        setSelectedRestaurant(foundRestaurant);

        // 해당 위치로 지도 이동
        if (mapInstance) {
          const position = new kakao.maps.LatLng(
            restaurant.lat,
            restaurant.lng
          );
          mapInstance.panTo(position);
        }
      }
    } else {
      // MOCK 데이터인 경우
      const foundRestaurant = restaurants.find((r) => r.id === restaurant.id);
      if (foundRestaurant) {
        console.log("✅ MOCK 음식점 발견:", foundRestaurant);
        setSelectedRestaurant(foundRestaurant);

        // 해당 위치로 지도 이동
        if (mapInstance) {
          const position = new kakao.maps.LatLng(
            restaurant.lat,
            restaurant.lng
          );
          mapInstance.panTo(position);
        }
      }
    }

    setSheetHeight("half");
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);

    // 해당 음식점의 마커 위치로 지도 이동
    const marker = mapMarkers.find((m) => m.id === restaurant.id);
    if (marker && mapInstance) {
      const position = new kakao.maps.LatLng(marker.lat, marker.lng);
      mapInstance.panTo(position);
      console.log("🗺️ 지도 이동:", restaurant.name, marker.lat, marker.lng);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleClearSearch = () => {
    // URL에서 food 파라미터 제거 (히스토리에 추가하지 않고 현재 항목을 대체)
    navigate("/map", { replace: true });
    // 카테고리 선택도 초기화
    setSelectedCategory(null);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // 검색 로직 (기존 홈 화면과 동일)
      navigate(`/map?food=${encodeURIComponent(query)}`);
      setIsSearchExpanded(false);
    }
  };

  const handleBookmark = (restaurantId: string) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId ? { ...r, isBookmarked: !r.isBookmarked } : r
      )
    );
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (onShowToast) {
      if (restaurant?.isBookmarked) {
        onShowToast("즐겨찾기에서 제거되었습니다.", "info");
      } else {
        onShowToast("즐겨찾기에 추가되었습니다.");
      }
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleDragEnd = (info: { offset: { y: number } }) => {
    if (info.offset.y > 100) {
      setSheetHeight("collapsed");
    } else if (info.offset.y < -100) {
      setSheetHeight(sheetHeight === "half" ? "full" : "half");
    }
  };

  const handleToggleHeight = () => {
    setSheetHeight(sheetHeight === "full" ? "half" : "full");
  };

  // 모바일에서는 더 낮게, 데스크톱에서는 기존 유지
  const sheetHeights = {
    collapsed: "80px", // 120px → 80px (모바일 최적화)
    half: "45dvh",
    full: "calc(100dvh - 120px)",
  };

  if (!hasLocationPermission) {
    return (
      <div className="flex flex-col h-full p-6 pb-24">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <IconMapPinOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3>위치 권한이 필요해요</h3>
            <p className="text-muted-foreground">
              내 주변 음식점을 찾기 위해 위치 권한이 필요합니다.
            </p>
            <Button
              onClick={onRequestPermission}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11"
            >
              <IconSettings className="w-4 h-4 mr-2" />
              권한 설정
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Back Button - 검색창 확장 시 숨김 */}
      <AnimatePresence>
        {!isSearchExpanded && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleBackToHome}
            className="absolute top-2 tablet:top-5 left-2 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer"
          >
            <IconChevronLeft className="w-5 h-5 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Header */}
      <MapHeader
        isSearchExpanded={isSearchExpanded}
        searchedFood={searchedFood}
        selectedCategory={selectedCategory}
        categories={CATEGORIES}
        onSearchExpand={() => {
          setIsSearchExpanded(true);
          setSheetHeight("collapsed");
        }}
        onSearchCollapse={() => setIsSearchExpanded(false)}
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        onClearSearch={handleClearSearch}
      />

      {/* Map */}
      <div className="flex-1 pt-18 tablet:pt-30">
        <MapView
          restaurants={mapMarkers}
          onPinClick={handlePinClick}
          selectedId={selectedRestaurant?.id ?? undefined}
          center={userLocation ?? undefined}
          onMapReady={setMapInstance}
        />
      </div>

      {/* Bottom Sheet */}
      <RestaurantSheet
        sheetHeight={sheetHeight}
        sheetHeights={sheetHeights}
        searchedFood={searchedFood}
        selectedCategory={selectedCategory}
        filteredRestaurants={filteredRestaurants}
        selectedRestaurant={selectedRestaurant}
        isSearchLoading={isSearchLoading}
        searchError={searchError}
        locationState={locationState}
        onDragEnd={handleDragEnd}
        onToggleHeight={handleToggleHeight}
        onRestaurantClick={handleRestaurantClick}
        onClearSearch={handleClearSearch}
        onBackToHome={handleBackToHome}
      />

      {/* Restaurant Detail Modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            onBookmark={() => handleBookmark(selectedRestaurant.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
