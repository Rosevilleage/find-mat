import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/shared/lib/utils";

interface FoodChipsProps {
  foods: string[];
  onRemove: (index: number) => void;
}

export function FoodChips({ foods, onRemove }: FoodChipsProps) {
  if (foods.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        추가된 음식이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {foods.map((food, index) => (
          <motion.div
            key={`${food}-${index}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "bg-secondary text-secondary-foreground",
              "text-sm whitespace-nowrap"
            )}
          >
            <span>{food}</span>
            <button
              onClick={() => onRemove(index)}
              className={cn(
                "hover:bg-secondary-foreground/10 rounded-full p-0.5",
                "transition-colors"
              )}
              aria-label={`${food} 삭제`}
            >
              <IconX size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
