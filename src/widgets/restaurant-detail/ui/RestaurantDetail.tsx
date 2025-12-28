import { IconX, IconPhone, IconWorld, IconNavigation, IconStar, IconClock, IconBookmark } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Restaurant } from '@/entities/restaurant';
import { Button } from '@/shared/ui/kit/button';
import { cn } from '@/shared/lib/utils';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onClose: () => void;
  onBookmark?: () => void;
}

export function RestaurantDetail({ 
  restaurant, 
  onClose,
  onBookmark
}: RestaurantDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[90vh] bg-background rounded-t-[24px] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>

          {/* Gallery Placeholder */}
          <div className="relative h-48 bg-linear-to-br from-primary/10 to-primary/5">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">이미지 없음</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2>{restaurant.name}</h2>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs",
                restaurant.isOpen 
                  ? 'bg-success/10 text-success' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {restaurant.isOpen ? '영업중' : '영업종료'}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{restaurant.category}</span>
              <span>•</span>
              <span>{restaurant.distanceText}</span>
              <span>•</span>
              <span>{restaurant.priceLevel}</span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <IconStar className="w-5 h-5 text-warning fill-warning" />
              <span className="text-lg">{restaurant.rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">(평균 평점)</span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconClock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">영업시간</span>
            </div>
            <p className="text-sm text-muted-foreground">
              월-금: 11:00 - 22:00<br />
              토-일: 12:00 - 23:00
            </p>
          </div>

          {/* Menu Items */}
          {restaurant.menuItems && restaurant.menuItems.length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4">
              <h3 className="mb-3">대표 메뉴</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.menuItems.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-background rounded-lg text-sm border border-border"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bookmark Button */}
          {onBookmark && (
            <Button
              onClick={onBookmark}
              className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <IconBookmark className={cn(
                "w-5 h-5 mr-2",
                restaurant.isBookmarked && 'fill-current'
              )} />
              {restaurant.isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            </Button>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-2"
            >
              <IconPhone className="w-5 h-5 mb-1" />
              <span className="text-xs">전화</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-2"
            >
              <IconWorld className="w-5 h-5 mb-1" />
              <span className="text-xs">웹사이트</span>
            </Button>
            <Button
              variant="outline"
              className="flex-col h-auto py-3 rounded-xl border-2"
            >
              <IconNavigation className="w-5 h-5 mb-1" />
              <span className="text-xs">길찾기</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

