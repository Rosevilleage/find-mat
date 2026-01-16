import { useLocalStorage } from "@/shared/hooks";
import { type UseFoodListReturn, MAX_CUSTOM_FOODS } from "./types";

const STORAGE_KEY = "custom-food-list";

export function useFoodList(): UseFoodListReturn {
  const [foods, setFoods] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const addFood = (food: string): { success: boolean; error?: string } => {
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

    // Max limit check
    if (foods.length >= MAX_CUSTOM_FOODS) {
      return {
        success: false,
        error: `최대 ${MAX_CUSTOM_FOODS}개까지 추가 가능합니다`,
      };
    }

    // Duplicate check (case-insensitive)
    if (foods.some((f) => f.toLowerCase() === trimmedFood.toLowerCase())) {
      return { success: false, error: "이미 추가된 음식입니다" };
    }

    // Add to list
    setFoods([...foods, trimmedFood]);
    return { success: true };
  };

  const removeFood = (index: number): void => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const clearAll = (): void => {
    setFoods([]);
  };

  return {
    foods,
    addFood,
    removeFood,
    clearAll,
  };
}
