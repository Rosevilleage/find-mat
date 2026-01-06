/**
 * 음식점 장소 정보
 * Places API 검색 결과를 앱에서 사용하기 쉬운 형태로 변환한 타입
 */
export interface FoodPlace {
  /** 장소 ID (Kakao Place ID) */
  id: string;
  /** 장소명 */
  name: string;
  /** 주소 */
  address: string;
  /** 도로명 주소 */
  roadAddress?: string;
  /** 전화번호 */
  phone?: string;
  /** 카테고리 */
  category: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
  /** Kakao 지도 URL */
  placeUrl?: string;
  /** 거리 (미터) */
  distance?: number;
}

/**
 * Places 검색 상태
 */
export interface PlacesSearchState {
  /** 검색 결과 */
  results: FoodPlace[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 총 결과 개수 */
  totalCount: number;
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean;
}
