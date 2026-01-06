import { useState, useEffect, useCallback } from "react";
import {
  searchPlacesByKeyword,
  isSearchSuccess,
  isSearchEmpty,
  type PlacesSearchResult,
  type SearchPlacesOptions,
} from "@/shared/lib/kakao-map";
import type { FoodPlace, PlacesSearchState } from "../model/types";

/**
 * PlacesSearchResult를 FoodPlace로 변환합니다.
 *
 * @param result - Kakao Places API 검색 결과
 * @returns 변환된 FoodPlace 객체
 */
function convertToFoodPlace(result: PlacesSearchResult): FoodPlace {
  return {
    id: result.id,
    name: result.place_name,
    address: result.address_name,
    roadAddress: result.road_address_name || undefined,
    phone: result.phone || undefined,
    category: result.category_name,
    lat: parseFloat(result.y),
    lng: parseFloat(result.x),
    placeUrl: result.place_url || undefined,
    distance: result.distance ? parseInt(result.distance, 10) : undefined,
  };
}

/**
 * usePlacesSearch 훅 옵션
 */
export interface UsePlacesSearchOptions {
  /** 중심 좌표 */
  location?: { lat: number; lng: number };
  /** 검색 반경 (미터) */
  radius?: number;
  /** 검색을 즉시 실행할지 여부 (기본값: true) */
  immediate?: boolean;
  /** 키워드가 비어있을 때 검색할지 여부 (기본값: false) */
  searchOnEmpty?: boolean;
}

/**
 * usePlacesSearch 훅 반환 타입
 */
export interface UsePlacesSearchReturn extends PlacesSearchState {
  /** 검색을 다시 실행하는 함수 */
  refetch: () => void;
  /** 검색을 취소하는 함수 */
  cancel: () => void;
}

/**
 * Kakao Places API를 사용하여 음식점을 검색하는 커스텀 훅
 *
 * @param keyword - 검색 키워드
 * @param options - 검색 옵션
 * @returns 검색 상태 및 제어 함수
 *
 * @example
 * ```tsx
 * const { results, isLoading, error, refetch } = usePlacesSearch('치킨', {
 *   location: { lat: 37.5665, lng: 126.978 },
 *   radius: 5000
 * });
 *
 * return (
 *   <div>
 *     {isLoading && <p>검색 중...</p>}
 *     {error && <p>에러: {error}</p>}
 *     {results.map(place => (
 *       <div key={place.id}>{place.name}</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function usePlacesSearch(
  keyword: string,
  options: UsePlacesSearchOptions = {}
): UsePlacesSearchReturn {
  const {
    location,
    radius = 5000,
    immediate = true,
    searchOnEmpty = false,
  } = options;

  const [state, setState] = useState<PlacesSearchState>({
    results: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    hasNextPage: false,
  });

  // 검색 취소 플래그
  const [isCancelled, setIsCancelled] = useState(false);

  /**
   * 검색을 실행하는 함수
   */
  const executeSearch = useCallback(async () => {
    // 키워드가 비어있으면 검색하지 않음 (searchOnEmpty이 false인 경우)
    if (!keyword.trim() && !searchOnEmpty) {
      setState({
        results: [],
        isLoading: false,
        error: null,
        totalCount: 0,
        hasNextPage: false,
      });
      return;
    }

    // 검색 시작
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    setIsCancelled(false);

    try {
      const searchOptions: SearchPlacesOptions = {
        location,
        radius,
        size: 15, // 한 페이지에 최대 15개
      };

      const response = await searchPlacesByKeyword(keyword, searchOptions);

      // 검색이 취소되었으면 상태 업데이트하지 않음
      if (isCancelled) {
        return;
      }

      if (isSearchSuccess(response)) {
        // 검색 성공
        const foodPlaces = response.data.map(convertToFoodPlace);

        setState({
          results: foodPlaces,
          isLoading: false,
          error: null,
          totalCount: response.pagination.totalCount,
          hasNextPage: response.pagination.hasNextPage,
        });
      } else if (isSearchEmpty(response)) {
        // 검색 결과 없음
        setState({
          results: [],
          isLoading: false,
          error: null,
          totalCount: 0,
          hasNextPage: false,
        });
      } else {
        // 검색 에러
        setState({
          results: [],
          isLoading: false,
          error: "검색 중 오류가 발생했습니다.",
          totalCount: 0,
          hasNextPage: false,
        });
      }
    } catch (error) {
      // 검색이 취소되었으면 상태 업데이트하지 않음
      if (isCancelled) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "검색 중 알 수 없는 오류가 발생했습니다.";

      setState({
        results: [],
        isLoading: false,
        error: errorMessage,
        totalCount: 0,
        hasNextPage: false,
      });
    }
  }, [keyword, location, radius, searchOnEmpty, isCancelled]);

  /**
   * 검색을 취소하는 함수
   */
  const cancel = useCallback(() => {
    setIsCancelled(true);
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  // 키워드 변경 시 자동 검색 (immediate가 true인 경우)
  useEffect(() => {
    if (immediate) {
      void executeSearch();
    }

    // 컴포넌트 언마운트 시 검색 취소
    return () => {
      setIsCancelled(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, location, radius, immediate, searchOnEmpty]);

  return {
    ...state,
    refetch: executeSearch,
    cancel,
  };
}
