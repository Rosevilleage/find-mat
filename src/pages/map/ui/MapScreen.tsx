import React, { useState, useMemo, lazy, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { usePlacesSearchQuery } from "@/features/search-food-places";
import { MapView, useCurrentLocation } from "@/shared/ui/map-view";
import type { Restaurant } from "@/entities/restaurant";
import { useToast } from "@/shared/contexts";

// Vercel Best Practice: bundle-dynamic-imports - 무거운 모달을 lazy loading
const RestaurantDetail = lazy(() =>
  import("@/widgets/restaurant-detail").then((m) => ({
    default: m.RestaurantDetail,
  }))
);
import {
  IconMapPinOff,
  IconSettings,
  IconChevronLeft,
  IconRefresh,
} from "@tabler/icons-react";
import { Button } from "@/shared/ui/kit/button";
import { CATEGORIES } from "@/shared/config";
import { useGeolocation } from "@/shared/hooks";
import { MapHeader } from "./MapHeader";
import { RestaurantSheet } from "./RestaurantSheet";
import { useMapData } from "../lib/useMapData";
import { cn } from "@/shared/lib/utils";

interface MapScreenProps {
  hasLocationPermission?: boolean;
  onRequestPermission?: () => void;
}

export function MapScreen({
  hasLocationPermission = true,
  onRequestPermission,
}: MapScreenProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
      if (showToast) {
        if (geoError.includes("거부")) {
          showToast(
            "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.",
            "error"
          );
        } else if (geoError.includes("사용할 수 없습니다")) {
          // POSITION_UNAVAILABLE 에러 - 시스템 위치 서비스 비활성화
          showToast(
            "시스템 위치 서비스가 비활성화되어 있습니다. 시스템 설정에서 위치 서비스를 활성화해주세요.",
            "error"
          );
        } else {
          showToast(geoError, "error");
        }
        hasShownToast.current = true;
      }
    }
  }, [geoError, showToast]);

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
            showToast &&
            !hasShownPermissionToast
          ) {
            hasShownPermissionToast = true;
            showToast("위치 권한이 허용되었습니다.", "success");
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
  }, [showToast]);

  // URL에서 검색 파라미터 읽기
  const searchedFood = searchParams.get("food");
  const searchLat = searchParams.get("lat");
  const searchLng = searchParams.get("lng");
  const searchRadius = searchParams.get("radius");

  // 검색 위치: URL 파라미터가 있으면 사용, 없으면 사용자 위치 사용
  // Vercel Best Practice: rerender-dependencies - 원시 값으로 의존성 변경
  const userLat = userLocation?.lat;
  const userLng = userLocation?.lng;
  const searchLocation = useMemo(() => {
    if (searchLat && searchLng) {
      return {
        lat: parseFloat(searchLat),
        lng: parseFloat(searchLng),
      };
    }
    if (userLat !== undefined && userLng !== undefined) {
      return { lat: userLat, lng: userLng };
    }
    return undefined;
  }, [searchLat, searchLng, userLat, userLng]);

  // 검색 반경: URL 파라미터가 있으면 사용, 없으면 5km 기본값
  const radius = searchRadius ? parseInt(searchRadius) : 5000;

  // Places API로 음식점 검색 (URL에 food 파라미터가 있을 때만)
  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = usePlacesSearchQuery({
    keyword: searchedFood || "",
    location: searchLocation,
    radius,
    enabled: !!searchedFood, // food 파라미터가 있을 때만 검색 실행
  });

  // 검색 결과 추출 (useMemo로 래핑하여 불필요한 재계산 방지)
  const searchResults = useMemo(() => {
    return searchData?.results || [];
  }, [searchData]);

  // 로컬 상태 관리
  const restaurants: Restaurant[] = [];
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

    // 검색 결과에서 해당 음식점 찾기
    const foundRestaurant = searchedRestaurants.find(
      (r) => r.id === restaurant.id
    );
    if (foundRestaurant) {
      console.log("✅ 음식점 발견:", foundRestaurant);
      setSelectedRestaurant(foundRestaurant);

      // 해당 위치로 지도 이동
      if (mapInstance) {
        const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
        mapInstance.panTo(position);
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

  const handleCategorySelect = (category: string) => {
    if (category === selectedCategory) {
      // 이미 선택된 카테고리를 다시 클릭하면 선택 해제
      setSelectedCategory(null);
      handleClearSearch();
    } else {
      // 새로운 카테고리 선택 시 검색 실행
      setSelectedCategory(category);
      navigate(`/map?food=${encodeURIComponent(category)}`);
    }
  };

  const handleRefreshSearch = () => {
    if (!mapInstance) return;

    // 현재 지도의 중심 좌표 가져오기
    const center = mapInstance.getCenter();
    const centerLat = center.getLat();
    const centerLng = center.getLng();

    // 현재 줌 레벨에 따라 검색 반경 조정
    const level = mapInstance.getLevel();
    let radius = 5000; // 기본 5km

    if (level <= 3) {
      radius = 1000; // 1km
    } else if (level <= 5) {
      radius = 2000; // 2km
    } else if (level <= 7) {
      radius = 3000; // 3km
    } else if (level <= 9) {
      radius = 5000; // 5km
    } else {
      radius = 10000; // 10km
    }

    console.log("🔄 새로고침 검색:", { centerLat, centerLng, level, radius });

    // 현재 검색어 또는 카테고리가 있으면 해당 키워드로 검색, 없으면 "음식점"으로 검색
    const keyword = searchedFood || selectedCategory || "음식점";

    // 위치 정보와 반경을 URL 파라미터에 추가하여 검색
    navigate(
      `/map?food=${encodeURIComponent(
        keyword
      )}&lat=${centerLat}&lng=${centerLng}&radius=${radius}`
    );

    if (showToast) {
      showToast(`반경 ${radius / 1000}km 내 ${keyword} 검색 중...`, "info");
    }
  };

  const handleDragEnd = (info: { offset: { y: number } }) => {
    if (info.offset.y > 100) {
      setSheetHeight(sheetHeight === "half" ? "collapsed" : "half");
    } else if (info.offset.y < -100) {
      setSheetHeight(sheetHeight === "half" ? "full" : "half");
    }
  };

  const handleToggleHeight = () => {
    setSheetHeight(sheetHeight === "full" ? "collapsed" : "full");
  };

  const sheetHeights = {
    collapsed: "80px",
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
      {/* Back Button - 검색창 확장 시 숨김 - Vercel Best Practice: rendering-conditional-render */}
      <AnimatePresence>
        {!isSearchExpanded ? (
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
        ) : null}
      </AnimatePresence>

      {/* Refresh Button - 검색창 확장 시 숨김 */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleRefreshSearch}
          className={cn(
            "absolute left-2 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer",
            searchedFood ? "top-26 tablet:top-32" : "top-20 tablet:top-32"
          )}
        >
          <IconRefresh className="w-5 h-5 text-foreground" />
        </motion.button>
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
          userLocation={userLocation ?? null}
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

      {/* Restaurant Detail Modal - Vercel Best Practice: rendering-conditional-render */}
      <AnimatePresence>
        {selectedRestaurant ? (
          <Suspense fallback={null}>
            <RestaurantDetail
              restaurant={selectedRestaurant}
              onClose={() => setSelectedRestaurant(null)}
            />
          </Suspense>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
