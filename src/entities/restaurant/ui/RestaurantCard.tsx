import { IconMapPin, IconPhone, IconExternalLink } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { Restaurant } from "../model/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  isSelected?: boolean;
}

export function RestaurantCard({
  restaurant,
  onClick,
  isSelected = false,
}: RestaurantCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-all",
        isSelected
          ? "border-primary border-2 shadow-md bg-primary/5"
          : "border-border"
      )}
    >
      <div className="flex flex-col gap-2 p-4">
        {/* 음식점 이름 */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold">{restaurant.name}</h4>
        </div>

        {/* 카테고리 */}
        <div className="text-xs text-muted-foreground">
          {restaurant.category}
        </div>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm">
          <IconMapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground/90 break-words">
              {restaurant.roadAddress || restaurant.address}
            </p>
            {restaurant.distance && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {restaurant.distance}m
              </p>
            )}
          </div>
        </div>

        {/* 전화번호 */}
        {restaurant.phone && (
          <div className="flex items-center gap-2 text-sm">
            <IconPhone className="w-4 h-4 text-muted-foreground shrink-0" />
            <a
              href={`tel:${restaurant.phone}`}
              className="text-foreground/90 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* 카카오맵 링크 */}
        {restaurant.placeUrl && (
          <div className="flex items-center gap-2 text-sm">
            <IconExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
            <a
              href={restaurant.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              카카오맵에서 보기
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
