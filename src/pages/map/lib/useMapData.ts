import { useMemo } from "react";
import type { Restaurant } from "@/entities/restaurant";
import type { FoodPlace } from "@/features/search-food-places";

interface UseMapDataParams {
  restaurants: Restaurant[];
  searchedFood: string | null;
  searchResults: FoodPlace[];
  selectedCategory: string | null;
}

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export function useMapData({
  restaurants,
  searchedFood,
  searchResults,
  selectedCategory,
}: UseMapDataParams) {
  // 검색 결과를 Restaurant 타입으로 변환
  const searchedRestaurants = useMemo((): Restaurant[] => {
    if (!searchedFood || searchResults.length === 0) {
      return [];
    }

    return searchResults.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category.split(" > ").pop() || "기타",
      distanceText: place.distance
        ? `${(place.distance / 1000).toFixed(1)}km`
        : "거리 정보 없음",
      priceLevel: "정보 없음",
      rating: 0, // Places API는 평점 정보를 제공하지 않음
      isOpen: true, // Places API는 영업 시간 정보를 제공하지 않음
      image: undefined,
      menuItems: [],
      isBookmarked: false,
    }));
  }, [searchedFood, searchResults]);

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

  // 검색된 음식을 파는 식당 필터링
  const filteredRestaurants = useMemo(() => {
    if (searchedFood) {
      // Places API 검색 결과 사용
      return searchedRestaurants;
    } else if (selectedCategory) {
      // 카테고리로 필터링
      return restaurants.filter((r) => r.category === selectedCategory);
    } else {
      // 카테고리별 최고 평점 식당만
      return getTopRatedByCategory(restaurants);
    }
  }, [restaurants, searchedFood, searchedRestaurants, selectedCategory]);

  // 지도 마커 데이터 생성
  const mapMarkers = useMemo((): MapMarker[] => {
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

  return {
    filteredRestaurants,
    searchedRestaurants,
    mapMarkers,
  };
}
