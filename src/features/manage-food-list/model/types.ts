export interface FoodListState {
  foods: string[];
}

export interface UseFoodListReturn {
  foods: string[];
  addFood: (food: string) => { success: boolean; error?: string };
  removeFood: (index: number) => void;
  clearAll: () => void;
}

export const MAX_CUSTOM_FOODS = 50;
