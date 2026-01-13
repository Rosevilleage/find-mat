import { IconX, IconMapPin, IconPhone, IconExternalLink } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import type { Restaurant } from '@/entities/restaurant';
import { Toast } from '@/shared/ui/toast';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export function RestaurantDetail({
  restaurant,
  onClose
}: RestaurantDetailProps) {
  const phoneRef = useRef<HTMLAnchorElement>(null);
  const mapRef = useRef<HTMLAnchorElement>(null);
  const [showToast, setShowToast] = useState(false);

  const handleAddressClick = async () => {
    const address = restaurant.roadAddress || restaurant.address;

    try {
      await navigator.clipboard.writeText(address);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handlePhoneAreaClick = () => {
    phoneRef.current?.click();
  };

  const handleMapAreaClick = () => {
    mapRef.current?.click();
  };

  return (
    <>
      <Toast
        message="주소가 복사되었습니다"
        type="success"
        isVisible={showToast}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full tablet:max-w-tablet max-h-[90vh] bg-background rounded-t-[24px] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-border">
            <h2 className="pr-12">{restaurant.name}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-muted/50 hover:bg-muted rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {/* 카테고리 */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{restaurant.category}</p>
            </div>

            {/* 주소 */}
            <div
              className="bg-muted/50 rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
              onClick={handleAddressClick}
            >
              <div className="flex items-start gap-3">
                <IconMapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">주소</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {restaurant.roadAddress || restaurant.address}
                  </p>
                  {restaurant.distance && (
                    <p className="text-xs text-muted-foreground mt-1">
                      거리: {restaurant.distance}m
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 전화번호 */}
            {restaurant.phone && (
              <div
                className="bg-muted/50 rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={handlePhoneAreaClick}
              >
                <div className="flex items-center gap-3">
                  <IconPhone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">전화번호</p>
                    <a
                      ref={phoneRef}
                      href={`tel:${restaurant.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 카카오맵 링크 */}
            {restaurant.placeUrl && (
              <div
                className="bg-muted/50 rounded-xl p-4 cursor-pointer hover:bg-muted transition-colors"
                onClick={handleMapAreaClick}
              >
                <div className="flex items-center gap-3">
                  <IconExternalLink className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">웹사이트</p>
                    <a
                      ref={mapRef}
                      href={restaurant.placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      카카오맵에서 보기
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

