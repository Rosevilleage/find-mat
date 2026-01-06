import { useQuery } from "@tanstack/react-query";
import {
  searchPlacesByKeyword,
  type PlacesSearchResult,
  type SearchPlacesOptions,
} from "@/shared/lib/kakao-map";
import type { FoodPlace } from "../model/types";

/**
 * PlacesSearchResult를 FoodPlace로 변환합니다.
 *
 * @param place - Kakao Places SDK 검색 결과
 * @returns 변환된 FoodPlace 객체
 */
function convertToFoodPlace(place: PlacesSearchResult): FoodPlace {
  return {
    id: place.id,
    name: place.place_name,
    address: place.address_name,
    roadAddress: place.road_address_name || undefined,
    phone: place.phone || undefined,
    category: place.category_name,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
    placeUrl: place.place_url || undefined,
    distance: place.distance ? parseInt(place.distance, 10) : undefined,
  };
}

/**
 * usePlacesSearch 훅 옵션
 */
export interface UsePlacesSearchQueryOptions {
  /** 검색 키워드 */
  keyword: string;
  /** 중심 좌표 */
  location?: { lat: number; lng: number };
  /** 검색 반경 (미터) */
  radius?: number;
  /** 검색 실행 여부 */
  enabled?: boolean;
}

/**
 * Kakao Places SDK를 사용하여 음식점을 검색하는 React Query 훅
 *
 * @param options - 검색 옵션
 * @returns React Query 결과 객체
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePlacesSearchQuery({
 *   keyword: '치킨',
 *   location: { lat: 37.5665, lng: 126.978 },
 *   radius: 5000,
 *   enabled: true
 * });
 *
 * return (
 *   <div>
 *     {isLoading && <p>검색 중...</p>}
 *     {error && <p>에러: {error.message}</p>}
 *     {data?.results.map(place => (
 *       <div key={place.id}>{place.name}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePlacesSearchQuery(options: UsePlacesSearchQueryOptions) {
  const { keyword, location, radius = 5000, enabled = true } = options;

  return useQuery({
    // Query Key: 검색 조건이 바뀌면 새로 요청
    queryKey: ["places", "search", keyword, location, radius],

    // Query Function: Places SDK 호출
    queryFn: async () => {
      if (!keyword?.trim()) {
        return {
          results: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      const searchOptions: SearchPlacesOptions = {
        location,
        radius,
        size: 15, // 한 페이지에 최대 15개
      };

      console.log("🔍 Places SDK 검색 시작:", keyword, searchOptions);

      const response = await searchPlacesByKeyword(keyword, searchOptions);

      console.log("✅ 검색 완료:", response.status, response.data.length, "개");

      // 검색 결과가 없거나 에러인 경우
      if (response.status === "ZERO_RESULT") {
        return {
          results: [],
          totalCount: 0,
          hasNextPage: false,
        };
      }

      if (response.status === "ERROR") {
        throw new Error("검색 중 오류가 발생했습니다.");
      }

      // FoodPlace 타입으로 변환
      const foodPlaces = response.data.map(convertToFoodPlace);

      return {
        results: foodPlaces,
        totalCount: response.pagination.totalCount,
        hasNextPage: response.pagination.hasNextPage,
      };
    },

    // 옵션
    enabled: enabled && !!keyword?.trim(), // keyword가 있을 때만 검색 실행
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: 1, // 실패 시 1번만 재시도
  });
}
