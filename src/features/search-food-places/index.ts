/**
 * search-food-places feature
 *
 * Kakao Local REST API를 사용하여 음식점을 검색하는 기능
 */

// API - React Query 버전 (권장)
export {
  usePlacesSearchQuery,
  type UsePlacesSearchQueryOptions,
} from "./api/usePlacesSearchQuery";

// API - 기존 버전 (레거시)
export {
  usePlacesSearch,
  type UsePlacesSearchOptions,
  type UsePlacesSearchReturn,
} from "./api/usePlacesSearch";

// Model
export type { FoodPlace, PlacesSearchState } from "./model/types";
