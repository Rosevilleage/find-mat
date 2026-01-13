import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { SearchBar } from "@/features/search-restaurant";
import { CategoryChips } from "@/features/select-category";
import { cn } from "@/shared/lib/utils";

interface MapHeaderProps {
  isSearchExpanded: boolean;
  searchedFood: string | null;
  selectedCategory: string | null;
  categories: string[];
  onSearchExpand: () => void;
  onSearchCollapse: () => void;
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
  onClearSearch: () => void;
}

export function MapHeader({
  isSearchExpanded,
  searchedFood,
  selectedCategory,
  categories,
  onSearchExpand,
  onSearchCollapse,
  onSearch,
  onCategorySelect,
  onClearSearch,
}: MapHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20">
      {/* 모바일 레이아웃 */}
      <div className="tablet:hidden">
        <AnimatePresence mode="wait">
          {!isSearchExpanded ? (
            <>
              <motion.div
                key="category-chips"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-2"
              >
                <div
                  className={cn(
                    "flex-1 overflow-hidden pt-3 pl-13",
                    isSearchExpanded && "px-0"
                  )}
                >
                  <CategoryChips
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={onCategorySelect}
                  />
                </div>
                <SearchBar
                  variant="icon"
                  isExpanded={false}
                  onExpand={onSearchExpand}
                />
              </motion.div>
              {searchedFood && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-background border border-primary/20 rounded-xl px-4 py-2"
                >
                  <span className="text-sm flex-1">
                    {searchedFood !== "음식점" ? (
                      <>
                        <span className="text-primary">'{searchedFood}'</span>
                        을(를) 파는 식당{" "}
                      </>
                    ) : (
                      <p className="text-primary text-center">주변 식당</p>
                    )}
                  </span>
                  <button
                    onClick={onClearSearch}
                    className="p-1 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <IconX className="w-4 h-4 text-primary" />
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              key="search-bar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2 pt-2"
            >
              <SearchBar
                variant="icon"
                isExpanded={true}
                onCollapse={onSearchCollapse}
                onSearch={onSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 데스크톱 레이아웃 (기존 유지) */}
      <div className="hidden tablet:block space-y-3 py-4">
        <SearchBar onFilterClick={() => {}} />

        {/* 검색된 음식 표시 */}
        {searchedFood && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2"
          >
            <span className="text-sm flex-1">
              <span className="text-primary">'{searchedFood}'</span>을(를) 파는
              식당
            </span>
            <button
              onClick={onClearSearch}
              className="p-1 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
            >
              <IconX className="w-4 h-4 text-primary" />
            </button>
          </motion.div>
        )}

        {!searchedFood && (
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={onCategorySelect}
          />
        )}
      </div>
    </div>
  );
}
