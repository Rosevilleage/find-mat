import { useCallback } from "react";
import { useLocalStorage } from "@/shared/hooks";
import { type UseFoodListReturn, MAX_CUSTOM_FOODS } from "./types";

const STORAGE_KEY = "custom-food-list";

export function useFoodList(): UseFoodListReturn {
  const [foods, setFoods] = useLocalStorage<string[]>(STORAGE_KEY, []);

  // Vercel Best Practice: rerender-functional-setstate
  const addFood = useCallback((food: string): { success: boolean; error?: string } => {
    const trimmedFood = food.trim();

    // Empty check
    if (!trimmedFood) {
      return { success: false, error: "음식 이름을 입력해주세요" };
    }

    // Korean incomplete character check (자음/모음만 입력된 경우)
    // U+3131-U+318E: Hangul Compatibility Jamo (ㄱ, ㄴ, ㅏ, ㅑ 등)
    const incompleteKoreanRegex = /[\u3131-\u318E]/;
    if (incompleteKoreanRegex.test(trimmedFood)) {
      return { success: false, error: "완성된 한글만 입력 가능합니다" };
    }

    // Functional update로 변경하여 최신 상태 참조
    let result: { success: boolean; error?: string } = { success: true };
    setFoods((currentFoods) => {
      // Max limit check
      if (currentFoods.length >= MAX_CUSTOM_FOODS) {
        result = {
          success: false,
          error: `최대 ${MAX_CUSTOM_FOODS}개까지 추가 가능합니다`,
        };
        return currentFoods;
      }

      // Duplicate check (case-insensitive)
      if (currentFoods.some((f) => f.toLowerCase() === trimmedFood.toLowerCase())) {
        result = { success: false, error: "이미 추가된 음식입니다" };
        return currentFoods;
      }

      // Add to list
      return [...currentFoods, trimmedFood];
    });
    return result;
  }, [setFoods]);

  const removeFood = useCallback((index: number): void => {
    setFoods((currentFoods) => currentFoods.filter((_, i) => i !== index));
  }, [setFoods]);

  const clearAll = useCallback((): void => {
    setFoods([]);
  }, [setFoods]);

  return {
    foods,
    addFood,
    removeFood,
    clearAll,
  };
}
