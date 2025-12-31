// 카테고리로 아이콘 매핑
import React from "react";
import {
  KoreanFoodIcon,
  ChineseFoodIcon,
  JapaneseFoodIcon,
  WesternFoodIcon,
  ChickenIcon,
  PizzaIcon,
  BurgerIcon,
  StreetFoodIcon,
  NoodleIcon,
  CurryIcon,
  TacoIcon,
  DessertIcon,
  DefaultIcon,
} from "../ui/FoodIcons";

interface IconProps {
  className?: string;
}

export function getCategoryIcon(
  category: string
): React.ComponentType<IconProps> {
  switch (category) {
    case "한식":
      return KoreanFoodIcon;
    case "중식":
      return ChineseFoodIcon;
    case "일식":
      return JapaneseFoodIcon;
    case "양식":
      return WesternFoodIcon;
    case "치킨":
      return ChickenIcon;
    case "피자":
      return PizzaIcon;
    case "버거":
      return BurgerIcon;
    case "분식":
      return StreetFoodIcon;
    case "베트남/태국":
      return NoodleIcon;
    case "인도/네팔":
      return CurryIcon;
    case "멕시칸":
      return TacoIcon;
    case "카페/디저트":
      return DessertIcon;
    default:
      return DefaultIcon;
  }
}

