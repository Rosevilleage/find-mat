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
      address: place.address,
      roadAddress: place.roadAddress || place.address,
      phone: place.phone || "",
      placeUrl: place.placeUrl || "",
      distance: place.distance ? place.distance.toString() : "",
      x: place.lng.toString(),
      y: place.lat.toString(),
    }));
  }, [searchedFood, searchResults]);

  // 카테고리별로 첫 번째 식당만 필터링
  const getFirstByCategory = (restaurantList: Restaurant[]) => {
    const categoryMap = new Map<string, Restaurant>();

    // 거리 순으로 정렬 (가까운 순)
    const sorted = [...restaurantList].sort((a, b) =>
      parseInt(a.distance || "0") - parseInt(b.distance || "0")
    );

    // 각 카테고리별로 첫 번째 식당만 선택
    sorted.forEach((restaurant) => {
      if (!categoryMap.has(restaurant.category)) {
        categoryMap.set(restaurant.category, restaurant);
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) =>
      parseInt(a.distance || "0") - parseInt(b.distance || "0")
    );
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
      // 카테고리별 첫 번째 식당만
      return getFirstByCategory(restaurants);
    }
  }, [restaurants, searchedFood, searchedRestaurants, selectedCategory]);

  // 지도 마커 데이터 생성
  const mapMarkers = useMemo((): MapMarker[] => {
    // Places API 검색 결과를 마커로 변환
    if (searchedFood && searchResults.length > 0) {
      const markers = searchResults.map((place) => ({
        id: place.id,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
      }));
      console.log("🗺️ 마커:", markers.length, "개", markers);
      return markers;
    }

    // 필터링된 레스토랑을 마커로 변환
    const markers = filteredRestaurants.slice(0, 8).map((r) => ({
      id: r.id,
      name: r.name,
      lat: parseFloat(r.y),
      lng: parseFloat(r.x),
    }));
    console.log("🗺️ 마커:", markers.length, "개");
    return markers;
  }, [searchedFood, searchResults, filteredRestaurants]);

  return {
    filteredRestaurants,
    searchedRestaurants,
    mapMarkers,
  };
}
