import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface CategoryChipsProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string) => void;
}

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {categories.map((category) => {
        const isSelected = selected === category;
        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
