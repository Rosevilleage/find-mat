import { motion } from "framer-motion";
import { IconChevronUp, IconMapPinOff } from "@tabler/icons-react";
import { RestaurantCard, type Restaurant } from "@/entities/restaurant";
import { CurrentLocationButton } from "@/shared/ui/map-view";

interface LocationState {
  isLoading: boolean;
  error: string | null;
  moveToCurrentLocation: () => void;
}

interface RestaurantSheetProps {
  sheetHeight: "collapsed" | "half" | "full";
  sheetHeights: Record<string, string>;
  searchedFood: string | null;
  selectedCategory: string | null;
  filteredRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isSearchLoading: boolean;
  searchError: Error | null;
  locationState: LocationState;
  onDragEnd: (info: { offset: { y: number } }) => void;
  onToggleHeight: () => void;
  onRestaurantClick: (restaurant: Restaurant) => void;
  onClearSearch: () => void;
  onBackToHome: () => void;
}

export function RestaurantSheet({
  sheetHeight,
  sheetHeights,
  searchedFood,
  selectedCategory,
  filteredRestaurants,
  selectedRestaurant,
  isSearchLoading,
  searchError,
  locationState,
  onDragEnd,
  onToggleHeight,
  onRestaurantClick,
  onClearSearch,
  onBackToHome,
}: RestaurantSheetProps) {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={(_, info) => onDragEnd(info)}
      animate={{ height: sheetHeights[sheetHeight] }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        mass: 0.5,
      }}
      className="absolute bottom-0 left-0 right-0 z-30"
    >
      {/* Bottom Sheet Background */}
      <div
        className="bg-background rounded-t-[24px] shadow-2xl overflow-hidden h-full"
        style={{
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Grab Handle */}
        <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Sheet Content */}
        <div className="px-4 pb-20 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            <h3>
              {searchedFood
                ? `'${searchedFood}' 파는 곳`
                : selectedCategory
                ? `${selectedCategory} 음식점`
                : "추천 음식점"}
              <span className="text-muted-foreground ml-2">
                ({filteredRestaurants.length})
              </span>
            </h3>
            <button
              onClick={onToggleHeight}
              className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <IconChevronUp
                className={`w-5 h-5 text-muted-foreground transition-transform ${
                  sheetHeight === "full" ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {isSearchLoading ? (
            <div className="space-y-3">
              {/* 스켈레톤 로더 */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl p-4 border animate-pulse"
                >
                  <div className="space-y-3">
                    {/* 제목 스켈레톤 */}
                    <div className="h-5 bg-muted rounded w-2/3" />
                    {/* 카테고리 스켈레톤 */}
                    <div className="h-4 bg-muted rounded w-1/2" />
                    {/* 주소 스켈레톤 */}
                    <div className="h-4 bg-muted rounded w-full" />
                    {/* 전화번호 스켈레톤 */}
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchError ? (
            <div className="text-center py-12 px-4">
              <IconMapPinOff className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="text-destructive mb-2 font-medium">
                검색 중 오류가 발생했습니다
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchError instanceof Error
                  ? searchError.message
                  : "알 수 없는 오류가 발생했습니다."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                다시 시도
              </button>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <IconMapPinOff className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="mb-2">
                {searchedFood
                  ? `'${searchedFood}' 검색 결과가 없어요`
                  : "음식점을 찾을 수 없어요"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchedFood
                  ? `주변 5km 내에 '${searchedFood}'을(를) 파는 음식점이 없습니다.`
                  : "다른 카테고리를 선택해보세요."}
              </p>
              {searchedFood && (
                <div className="space-y-2">
                  <button
                    onClick={onClearSearch}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    전체 음식점 보기
                  </button>
                  <button
                    onClick={onBackToHome}
                    className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    다른 음식 선택하기
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={() => onRestaurantClick(restaurant)}
                  isSelected={selectedRestaurant?.id === restaurant.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Current Location Button */}
      <div className="absolute right-4 -top-16">
        <CurrentLocationButton
          onClick={locationState.moveToCurrentLocation}
          isLoading={locationState.isLoading}
          disabled={locationState.isLoading}
        />
      </div>

      {/* Location Error Toast */}
      {locationState.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          data-testid="location-error-toast"
          className="absolute right-20 -top-14 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg text-sm"
        >
          {locationState.error}
        </motion.div>
      )}
    </motion.div>
  );
}
