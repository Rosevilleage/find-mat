import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence } from "framer-motion";
import { SearchBar } from "@/features/search-restaurant";
import { CategoryChips } from "@/features/select-category";
import { usePlacesSearchQuery } from "@/features/search-food-places";
import {
  MapView,
  CurrentLocationButton,
  useCurrentLocation,
} from "@/shared/ui/map-view";
import { RestaurantCard, MOCK_RESTAURANTS } from "@/entities/restaurant";
import { RestaurantDetail } from "@/widgets/restaurant-detail";
import type { Restaurant } from "@/entities/restaurant";
import { motion } from "framer-motion";
import {
  IconChevronUp,
  IconMapPinOff,
  IconSettings,
  IconX,
  IconChevronLeft,
} from "@tabler/icons-react";
import { Button } from "@/shared/ui/kit/button";
import { CATEGORIES } from "@/shared/config";
import { useGeolocation } from "@/shared/hooks";

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

  // 위치 에러가 있으면 콘솔에 로그
  React.useEffect(() => {
    if (geoError) {
      console.warn("📍 위치 정보:", geoError);
    }
  }, [geoError]);

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

  // 현재 위치 기능
  const {
    isLoading: isLocationLoading,
    error: locationError,
    moveToCurrentLocation,
  } = useCurrentLocation({
    map: mapInstance,
  });

  // 카테고리별로 최고 평점 식당만 필터링
  const getTopRatedByCategory = (restaurantList: Restaurant[]) => {
    const categoryMap = new Map<string, Restaurant>();

    // 평점 순으로 정렬
    const sorted = [...restaurantList].sort((a, b) => b.rating - a.rating);

    // 각 카테고리별로 최고 평점 식당만 선택
    sorted.forEach((restaurant) => {
      if (!categoryMap.has(restaurant.category)) {
        categoryMap.set(restaurant.category, restaurant);
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.rating - a.rating);
  };

  // 검색 결과를 Restaurant 타입으로 변환
  const searchedRestaurants = useMemo((): Restaurant[] => {
    if (!searchedFood || searchResults.length === 0) {
      return [];
    }

    return searchResults.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category.split(" > ").pop() || "기타",
      distanceText: place.distance ? `${(place.distance / 1000).toFixed(1)}km` : "거리 정보 없음",
      priceLevel: "정보 없음",
      rating: 0, // Places API는 평점 정보를 제공하지 않음
      isOpen: true, // Places API는 영업 시간 정보를 제공하지 않음
      image: undefined,
      menuItems: [],
      isBookmarked: false,
    }));
  }, [searchedFood, searchResults]);

  // 검색된 음식을 파는 식당 필터링
  let filteredRestaurants = restaurants;

  if (searchedFood) {
    // Places API 검색 결과 사용
    filteredRestaurants = searchedRestaurants;
  } else if (selectedCategory) {
    // 카테고리로 필터링
    filteredRestaurants = restaurants.filter(
      (r) => r.category === selectedCategory
    );
  } else {
    // 카테고리별 최고 평점 식당만
    filteredRestaurants = getTopRatedByCategory(restaurants);
  }

  const mockMapRestaurants = React.useMemo(() => {
    // Places API 검색 결과인 경우 실제 좌표 사용
    if (searchedFood && searchResults.length > 0) {
      const markers = searchResults.map((place) => ({
        id: place.id,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
      }));
      console.log("🗺️ Places API 마커:", markers.length, "개", markers);
      return markers;
    }

    // MOCK 데이터인 경우 서울 근처 고정 위치 할당 (ID 기반 해시)
    const mockMarkers = filteredRestaurants.slice(0, 8).map((r) => {
      const hash = r.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      // 서울 중심 (37.5665, 126.978) 기준 ±0.05 범위 내 랜덤 위치
      const latOffset = ((hash * 37) % 100) / 1000; // 0 ~ 0.1
      const lngOffset = ((hash * 73) % 100) / 1000; // 0 ~ 0.1
      return {
        ...r,
        lat: 37.5165 + latOffset, // 37.5165 ~ 37.6165
        lng: 126.928 + lngOffset, // 126.928 ~ 127.028
      };
    });
    console.log("🗺️ MOCK 마커:", mockMarkers.length, "개");
    return mockMarkers;
  }, [searchedFood, searchResults, filteredRestaurants]);

  const handlePinClick = (restaurant: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  }) => {
    console.log("🖱️ 마커 클릭:", restaurant);

    // Places API 검색 결과인 경우
    if (searchedFood && searchedRestaurants.length > 0) {
      const foundRestaurant = searchedRestaurants.find((r) => r.id === restaurant.id);
      if (foundRestaurant) {
        console.log("✅ Places API 음식점 발견:", foundRestaurant);
        setSelectedRestaurant(foundRestaurant);

        // 해당 위치로 지도 이동
        if (mapInstance) {
          const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
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
          const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
          mapInstance.panTo(position);
        }
      }
    }

    setSheetHeight("half");
  };

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);

    // 해당 음식점의 마커 위치로 지도 이동
    const marker = mockMapRestaurants.find((m) => m.id === restaurant.id);
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

  const sheetHeights = {
    collapsed: "120px",
    half: "45%",
    full: "85%",
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
    <div className="relative flex flex-col h-full">
      {/* Back Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-5 left-2 z-30 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors cursor-pointer"
      >
        <IconChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      {/* Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 py-4 space-y-3">
        <SearchBar onFilterClick={() => {}} />

        {/* 검색된 음식 표시 */}
        {searchedFood && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2"
          >
            <span className="text-sm flex-1">
              <span className="text-primary">'{searchedFood}'</span>을(를) 파는
              식당
            </span>
            <button
              onClick={handleClearSearch}
              className="p-1 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
            >
              <IconX className="w-4 h-4 text-primary" />
            </button>
          </motion.div>
        )}

        {!searchedFood && (
          <CategoryChips
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={(cat) => {
              setSelectedCategory(cat === selectedCategory ? null : cat);
            }}
          />
        )}
      </div>

      {/* Map */}
      <div className="flex-1 pt-32">
        <MapView
          restaurants={mockMapRestaurants}
          onPinClick={handlePinClick}
          selectedId={selectedRestaurant?.id ?? undefined}
          center={userLocation ?? undefined}
          onMapReady={setMapInstance}
        />
      </div>

      {/* Bottom Sheet Container */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) {
            setSheetHeight("collapsed");
          } else if (info.offset.y < -100) {
            setSheetHeight(sheetHeight === "half" ? "full" : "half");
          }
        }}
        animate={{ height: sheetHeights[sheetHeight] }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
          mass: 0.5,
        }}
        className="absolute bottom-0 left-0 right-0 z-30"
      >
        {/* Bottom Sheet Background */}
        <div
          className="bg-background rounded-t-[24px] shadow-2xl overflow-hidden h-full"
          style={{
            boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Grab Handle */}
          <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Sheet Content */}
          <div className="px-4 pb-20 overflow-y-auto h-full">
            <div className="flex items-center justify-between mb-4">
              <h3>
                {searchedFood
                  ? `'${searchedFood}' 파는 곳`
                  : selectedCategory
                  ? `${selectedCategory} 음식점`
                  : "추천 음식점"}
                <span className="text-muted-foreground ml-2">
                  ({filteredRestaurants.length})
                </span>
              </h3>
              <button
                onClick={() =>
                  setSheetHeight(sheetHeight === "full" ? "half" : "full")
                }
                className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
              >
                <IconChevronUp
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    sheetHeight === "full" ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {isSearchLoading ? (
              <div className="space-y-3">
                {/* 스켈레톤 로더 */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-xl p-4 border animate-pulse"
                  >
                    <div className="flex gap-3">
                      {/* 이미지 스켈레톤 */}
                      <div className="w-20 h-20 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        {/* 제목 스켈레톤 */}
                        <div className="h-5 bg-muted rounded w-3/4" />
                        {/* 카테고리 스켈레톤 */}
                        <div className="h-4 bg-muted rounded w-1/2" />
                        {/* 거리 스켈레톤 */}
                        <div className="h-4 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchError ? (
              <div className="text-center py-12 px-4">
                <IconMapPinOff className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="text-destructive mb-2 font-medium">검색 중 오류가 발생했습니다</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchError instanceof Error
                    ? searchError.message
                    : "알 수 없는 오류가 발생했습니다."}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  다시 시도
                </button>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <IconMapPinOff className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2">
                  {searchedFood
                    ? `'${searchedFood}' 검색 결과가 없어요`
                    : "음식점을 찾을 수 없어요"}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {searchedFood
                    ? `주변 5km 내에 '${searchedFood}'을(를) 파는 음식점이 없습니다.`
                    : "다른 카테고리를 선택해보세요."}
                </p>
                {searchedFood && (
                  <div className="space-y-2">
                    <button
                      onClick={handleClearSearch}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      전체 음식점 보기
                    </button>
                    <button
                      onClick={handleBackToHome}
                      className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      다른 음식 선택하기
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => handleRestaurantClick(restaurant)}
                    onBookmark={() => {}}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Location Button */}
        <div className="absolute right-4 -top-16">
          <CurrentLocationButton
            onClick={moveToCurrentLocation}
            isLoading={isLocationLoading}
            disabled={isLocationLoading}
          />
        </div>

        {/* Location Error Toast */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            data-testid="location-error-toast"
            className="absolute right-20 -top-14 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm"
          >
            {locationError}
          </motion.div>
        )}
      </motion.div>

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
