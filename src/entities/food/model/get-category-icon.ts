// 카테고리로 아이콘 매핑
import React from "react";
import {
  KoreanFoodIcon,
  ChineseFoodIcon,
  JapaneseFoodIcon,
  WesternFoodIcon,
  ChickenIcon,
  StreetFoodIcon,
  NoodleIcon,
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
    case "아시안":
      return NoodleIcon; // 베트남/태국 등 아시안 요리
    case "패스트푸드":
      return ChickenIcon; // 치킨, 핫도그 등
    case "분식":
      return StreetFoodIcon;
    case "해산물":
      return DefaultIcon; // 해산물 전용 아이콘 추가 필요
    case "고기":
      return DefaultIcon; // 고기 전용 아이콘 추가 필요
    case "샐러드":
      return DefaultIcon; // 샐러드 전용 아이콘 추가 필요
    default:
      return DefaultIcon;
  }
}
