import "./types";

/**
 * Places 검색 결과 타입
 * Kakao API의 원본 데이터를 그대로 사용
 */
export type PlacesSearchResult = kakao.maps.services.PlacesSearchResult;

/**
 * Places 검색 옵션
 */
export interface SearchPlacesOptions {
  /** 중심 좌표 */
  location?: { lat: number; lng: number };
  /** 검색 반경 (미터, 최대 20000) */
  radius?: number;
  /** 페이지 번호 (기본값: 1) */
  page?: number;
  /** 한 페이지에 표시할 결과 개수 (기본값: 15, 최대 15) */
  size?: number;
}

/**
 * Places 검색 응답 타입
 */
export interface SearchPlacesResponse {
  /** 검색 결과 데이터 */
  data: PlacesSearchResult[];
  /** 검색 상태 */
  status: "OK" | "ZERO_RESULT" | "ERROR";
  /** 페이지네이션 정보 */
  pagination: {
    current: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Places 서비스 인스턴스를 생성합니다.
 *
 * @returns Places 서비스 인스턴스
 * @throws Places 서비스를 사용할 수 없는 경우
 *
 * @example
 * ```typescript
 * const places = createPlacesService();
 * ```
 */
export function createPlacesService(): kakao.maps.services.Places {
  if (!window.kakao?.maps?.services?.Places) {
    throw new Error(
      "Kakao Places 서비스를 사용할 수 없습니다. SDK가 올바르게 로드되었는지 확인하세요."
    );
  }

  return new kakao.maps.services.Places();
}

/**
 * 키워드로 장소를 검색합니다.
 *
 * @param keyword - 검색 키워드
 * @param options - 검색 옵션
 * @returns 검색 결과 Promise
 *
 * @example
 * ```typescript
 * const result = await searchPlacesByKeyword('치킨', {
 *   location: { lat: 37.5665, lng: 126.978 },
 *   radius: 5000,
 *   size: 15
 * });
 *
 * if (result.status === 'OK') {
 *   console.log('검색 결과:', result.data);
 * }
 * ```
 */
export function searchPlacesByKeyword(
  keyword: string,
  options?: SearchPlacesOptions
): Promise<SearchPlacesResponse> {
  return new Promise((resolve, reject) => {
    try {
      const places = createPlacesService();

      // 검색 옵션 구성
      const searchOptions: kakao.maps.services.PlacesSearchOptions = {};

      if (options?.location) {
        searchOptions.location = new kakao.maps.LatLng(
          options.location.lat,
          options.location.lng
        );
      }

      if (options?.radius !== undefined) {
        searchOptions.radius = options.radius;
      }

      if (options?.page !== undefined) {
        searchOptions.page = options.page;
      }

      if (options?.size !== undefined) {
        searchOptions.size = options.size;
      }

      console.log("🔍 Kakao Places SDK 검색:", keyword, searchOptions);

      // 검색 실행
      places.keywordSearch(
        keyword,
        (data, status, pagination) => {
          console.log("📡 Places SDK 응답:", status, data.length, "개");

          // 상태 매핑
          let mappedStatus: "OK" | "ZERO_RESULT" | "ERROR";
          if (status === kakao.maps.services.Status.OK) {
            mappedStatus = "OK";
          } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            mappedStatus = "ZERO_RESULT";
          } else {
            mappedStatus = "ERROR";
          }

          // 응답 구성
          const response: SearchPlacesResponse = {
            data,
            status: mappedStatus,
            pagination: {
              current: pagination.current,
              totalCount: pagination.totalCount,
              hasNextPage: pagination.hasNextPage,
              hasPrevPage: pagination.hasPrevPage,
            },
          };

          resolve(response);
        },
        searchOptions
      );
    } catch (error) {
      console.error("❌ Places SDK 에러:", error);
      reject(error);
    }
  });
}

/**
 * 검색 결과가 성공적인지 확인합니다.
 *
 * @param response - 검색 응답
 * @returns 검색 성공 여부
 */
export function isSearchSuccess(
  response: SearchPlacesResponse
): response is SearchPlacesResponse & { status: "OK" } {
  return response.status === "OK";
}

/**
 * 검색 결과가 비어있는지 확인합니다.
 *
 * @param response - 검색 응답
 * @returns 검색 결과가 비어있는지 여부
 */
export function isSearchEmpty(
  response: SearchPlacesResponse
): response is SearchPlacesResponse & { status: "ZERO_RESULT" } {
  return response.status === "ZERO_RESULT";
}

/**
 * 검색 결과에 에러가 있는지 확인합니다.
 *
 * @param response - 검색 응답
 * @returns 검색 에러 여부
 */
export function isSearchError(
  response: SearchPlacesResponse
): response is SearchPlacesResponse & { status: "ERROR" } {
  return response.status === "ERROR";
}
