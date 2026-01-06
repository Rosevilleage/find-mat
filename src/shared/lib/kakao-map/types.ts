/**
 * Kakao Map JavaScript SDK 타입 선언
 * @see https://apis.map.kakao.com/web/documentation/
 */

// 전역 kakao 네임스페이스
declare global {
  interface Window {
    kakao: typeof kakao;
  }

  const kakao: {
    maps: {
      // SDK 로드 함수
      load: (callback: () => void) => void;

      // 지도 클래스
      Map: new (container: HTMLElement, options: kakao.maps.MapOptions) => kakao.maps.Map;

      // 좌표 클래스
      LatLng: new (lat: number, lng: number) => kakao.maps.LatLng;

      // 마커 클래스
      Marker: new (options: kakao.maps.MarkerOptions) => kakao.maps.Marker;

      // 마커 이미지 클래스
      MarkerImage: new (
        src: string,
        size: kakao.maps.Size,
        options?: kakao.maps.MarkerImageOptions
      ) => kakao.maps.MarkerImage;

      // 크기 클래스
      Size: new (width: number, height: number) => kakao.maps.Size;

      // 이벤트 유틸리티
      event: {
        addListener: (
          target: kakao.maps.Map | kakao.maps.Marker,
          type: string,
          handler: (...args: unknown[]) => void
        ) => void;
        removeListener: (
          target: kakao.maps.Map | kakao.maps.Marker,
          type: string,
          handler: (...args: unknown[]) => void
        ) => void;
      };

      // Places 서비스 클래스
      services: {
        Places: new (map?: kakao.maps.Map) => kakao.maps.services.Places;
        Status: {
          OK: string;
          ZERO_RESULT: string;
          ERROR: string;
        };
      };
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace kakao.maps {
    // 지도 옵션
    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    // 지도 인스턴스
    interface Map {
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setLevel(level: number, options?: { animate?: boolean }): void;
      getLevel(): number;
      panTo(latlng: LatLng): void;
    }

    // 좌표
    interface LatLng {
      getLat(): number;
      getLng(): number;
    }

    // 마커 옵션
    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
      title?: string;
      clickable?: boolean;
      zIndex?: number;
    }

    // 마커 인스턴스
    interface Marker {
      setMap(map: Map | null): void;
      getMap(): Map;
      setPosition(position: LatLng): void;
      getPosition(): LatLng;
      setImage(image: MarkerImage): void;
      setZIndex(zIndex: number): void;
      setTitle(title: string): void;
    }

    // 마커 이미지 옵션
    interface MarkerImageOptions {
      offset?: { x: number; y: number };
      alt?: string;
      coords?: string;
      shape?: string;
      spriteOrigin?: { x: number; y: number };
      spriteSize?: Size;
    }

    // 마커 이미지
    interface MarkerImage {
      // 추후 필요시 메서드 추가 가능
      readonly _brand: "MarkerImage";
    }

    // 크기
    interface Size {
      // 추후 필요시 메서드 추가 가능
      readonly _brand: "Size";
    }

    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace services {
      // Places 검색 결과 인터페이스
      interface PlacesSearchResult {
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

      // Pagination 인터페이스
      interface Pagination {
        current: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        gotoPage: (page: number) => void;
        gotoFirst: () => void;
        gotoLast: () => void;
        nextPage: () => void;
        prevPage: () => void;
      }

      // Places 검색 콜백 타입
      type PlacesSearchCallback = (
        data: PlacesSearchResult[],
        status: string,
        pagination: Pagination
      ) => void;

      // Places 검색 옵션
      interface PlacesSearchOptions {
        location?: LatLng;
        radius?: number;
        bounds?: LatLngBounds;
        page?: number;
        size?: number;
        sort?: string;
        category_group_code?: string;
      }

      // LatLngBounds 인터페이스
      interface LatLngBounds {
        // 추후 필요시 메서드 추가 가능
        readonly _brand: "LatLngBounds";
      }

      // Places 서비스 인터페이스
      interface Places {
        keywordSearch(
          keyword: string,
          callback: PlacesSearchCallback,
          options?: PlacesSearchOptions
        ): void;
        categorySearch(
          code: string,
          callback: PlacesSearchCallback,
          options?: PlacesSearchOptions
        ): void;
      }
    }
  }
}

export {};
