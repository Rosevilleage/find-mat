import axios from "axios";

/**
 * Kakao Local REST API 베이스 URL
 */
const KAKAO_LOCAL_API_BASE_URL = "https://dapi.kakao.com";

/**
 * Kakao Local REST API axios 인스턴스
 *
 * @see https://developers.kakao.com/docs/latest/ko/local/dev-guide
 */
export const kakaoLocalApi = axios.create({
  baseURL: KAKAO_LOCAL_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request 인터셉터: Authorization 헤더 추가
kakaoLocalApi.interceptors.request.use(
  (config) => {
    const apiKey = import.meta.env.VITE_MAP_KEY;

    if (!apiKey) {
      throw new Error("VITE_MAP_KEY 환경 변수가 설정되지 않았습니다.");
    }

    // Kakao REST API는 Authorization 헤더에 "KakaoAK {REST_API_KEY}" 형식으로 전달
    config.headers.Authorization = `KakaoAK ${apiKey}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터: 에러 처리
kakaoLocalApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        console.error("❌ Kakao API 인증 실패:", message);
        throw new Error("Kakao API 인증에 실패했습니다. API 키를 확인해주세요.");
      } else if (status === 429) {
        console.error("❌ Kakao API 할당량 초과:", message);
        throw new Error("API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        console.error("❌ Kakao API 에러:", status, message);
        throw new Error(message || "API 요청 중 오류가 발생했습니다.");
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error("❌ 네트워크 에러:", error.message);
      throw new Error("네트워크 연결을 확인해주세요.");
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error("❌ 요청 설정 에러:", error.message);
      throw new Error(error.message);
    }
  }
);

/**
 * Kakao Local API 키워드 검색 응답 타입
 */
export interface KakaoLocalSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoLocalPlace[];
}

/**
 * Kakao Local API 장소 정보 타입
 */
export interface KakaoLocalPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도 (longitude)
  y: string; // 위도 (latitude)
  place_url: string;
  distance: string;
}

/**
 * 키워드 검색 파라미터
 */
export interface SearchKeywordParams {
  /** 검색 키워드 */
  query: string;
  /** 중심 좌표 X (경도) */
  x?: number;
  /** 중심 좌표 Y (위도) */
  y?: number;
  /** 검색 반경 (미터, 최대 20000) */
  radius?: number;
  /** 페이지 번호 (1~45) */
  page?: number;
  /** 한 페이지에 보여질 문서의 개수 (1~15) */
  size?: number;
  /** 정렬 방식 (distance: 거리순, accuracy: 정확도순) */
  sort?: "distance" | "accuracy";
}

/**
 * Kakao Local API 키워드 검색
 *
 * @param params - 검색 파라미터
 * @returns 검색 결과
 *
 * @example
 * ```typescript
 * const result = await searchKeyword({
 *   query: '치킨',
 *   x: 127.0276,
 *   y: 37.4979,
 *   radius: 5000,
 *   size: 15
 * });
 * ```
 */
export async function searchKeyword(
  params: SearchKeywordParams
): Promise<KakaoLocalSearchResponse> {
  const { data } = await kakaoLocalApi.get<KakaoLocalSearchResponse>(
    "/v2/local/search/keyword.json",
    { params }
  );

  return data;
}
