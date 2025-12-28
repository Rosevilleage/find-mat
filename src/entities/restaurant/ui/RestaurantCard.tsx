import { IconStar, IconMapPin, IconBookmark } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { Restaurant } from "../model/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  onBookmark?: () => void;
}

export function RestaurantCard({
  restaurant,
  onClick,
  onBookmark,
}: RestaurantCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
          {restaurant.image ? (
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-xs">이미지 없음</span>
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs">영업종료</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate">{restaurant.name}</h4>
            {onBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
                className="p-1 hover:bg-muted rounded-lg transition-colors shrink-0"
              >
                <IconBookmark
                  className={cn(
                    "w-4 h-4",
                    restaurant.isBookmarked
                      ? "fill-current text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{restaurant.category}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <IconMapPin className="w-3 h-3" />
              {restaurant.distanceText}
            </span>
            <span>•</span>
            <span>{restaurant.priceLevel}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {/* Average Rating */}
            <div className="flex items-center gap-1">
              <IconStar className="w-4 h-4 text-warning fill-warning" />
              <span className="text-sm">{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
