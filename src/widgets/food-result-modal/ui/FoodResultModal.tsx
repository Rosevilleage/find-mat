import React from "react";
import { motion } from "framer-motion";
import { IconRefresh, IconMapPin, IconX } from "@tabler/icons-react";
import { getFoodIcon } from "@/entities/food";

interface FoodResultModalProps {
  foodName: string;
  onFindNearby: () => void;
  onRollAgain: () => void;
  onClose: () => void;
}

// 컴포넌트를 렌더링 외부에서 생성
const renderFoodIcon = (foodName: string, className?: string) => {
  const Icon = getFoodIcon(foodName);
  return <Icon key={foodName} className={className} />;
};

export function FoodResultModal({
  foodName,
  onFindNearby,
  onRollAgain,
  onClose,
}: FoodResultModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Sheet - iOS style */}
      <motion.div
        className="relative w-full max-w-[390px] bg-white rounded-t-[32px] overflow-hidden shadow-2xl"
        initial={{ y: 500, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 500, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 350,
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* Icon with animated entrance */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              damping: 15,
              stiffness: 300,
            }}
          >
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-xl">
              {renderFoodIcon(foodName, "w-14 h-14")}
            </div>
          </motion.div>

          {/* Result */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground mb-3">오늘의 메뉴는</p>
            <motion.div
              className="inline-block px-8 py-4 bg-linear-to-r from-indigo-600 to-indigo-500 rounded-2xl shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.4,
                type: "spring",
                damping: 20,
                stiffness: 300,
              }}
            >
              <h2 className="text-white">{foodName}</h2>
            </motion.div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Find Nearby Button - iOS style primary */}
            <button
              onClick={onFindNearby}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl transition-all duration-150 flex items-center justify-center gap-3 active:scale-[0.98] shadow-md"
            >
              <IconMapPin className="w-5 h-5" />
              <span>근처 음식점 찾기</span>
            </button>

            {/* Roll Again Button - iOS style secondary */}
            <button
              onClick={onRollAgain}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-900 rounded-2xl transition-all duration-150 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <IconRefresh className="w-5 h-5" />
              <span>다시 뽑기</span>
            </button>
          </motion.div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-150"
        >
          <IconX className="w-5 h-5 text-gray-500" />
        </button>
      </motion.div>
    </motion.div>
  );
}
