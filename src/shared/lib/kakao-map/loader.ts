import "./types";

/**
 * Kakao Map SDK 로드 상태
 */
let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Kakao Map SDK를 동적으로 로드합니다.
 *
 * @returns SDK 로드 완료를 나타내는 Promise
 * @throws SDK 로드 실패 시 에러
 *
 * @example
 * ```typescript
 * try {
 *   await loadKakaoMapSDK();
 *   // SDK 사용 가능
 *   const map = new kakao.maps.Map(...);
 * } catch (error) {
 *   console.error('지도 로드 실패:', error);
 * }
 * ```
 */
export function loadKakaoMapSDK(): Promise<void> {
  // 이미 로드된 경우
  if (isLoaded && window.kakao?.maps) {
    return Promise.resolve();
  }

  // 로딩 중인 경우 기존 Promise 반환
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  // 새로운 로딩 시작
  isLoading = true;

  loadPromise = new Promise<void>((resolve, reject) => {
    // API 키 확인
    const apiKey = import.meta.env.VITE_MAP_KEY;

    if (!apiKey) {
      isLoading = false;
      reject(new Error("VITE_MAP_KEY 환경 변수가 설정되지 않았습니다."));
      return;
    }

    // 스크립트가 이미 존재하는지 확인
    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
    );

    if (existingScript) {
      // 스크립트는 있지만 로드되지 않은 경우 대기
      if (window.kakao?.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
      } else {
        existingScript.addEventListener("load", () => {
          kakao.maps.load(() => {
            isLoaded = true;
            isLoading = false;
            resolve();
          });
        });

        existingScript.addEventListener("error", () => {
          isLoading = false;
          reject(new Error("Kakao Map SDK 로드에 실패했습니다."));
        });
      }
      return;
    }

    // 새 스크립트 태그 생성
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;

    // 로드 성공 핸들러
    script.addEventListener("load", () => {
      if (!window.kakao?.maps) {
        isLoading = false;
        reject(new Error("Kakao Map SDK가 정상적으로 로드되지 않았습니다."));
        return;
      }

      // kakao.maps.load()를 호출하여 SDK 초기화
      kakao.maps.load(() => {
        isLoaded = true;
        isLoading = false;
        resolve();
      });
    });

    // 로드 실패 핸들러
    script.addEventListener("error", () => {
      isLoading = false;
      reject(new Error("Kakao Map SDK 로드에 실패했습니다."));
    });

    // DOM에 스크립트 추가
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * SDK가 로드되었는지 확인합니다.
 *
 * @returns SDK 로드 여부
 */
export function isSDKLoaded(): boolean {
  return isLoaded && !!window.kakao?.maps;
}

/**
 * SDK 로딩 상태를 초기화합니다. (테스트용)
 *
 * @internal
 */
export function resetSDKState(): void {
  isLoading = false;
  isLoaded = false;
  loadPromise = null;
}
