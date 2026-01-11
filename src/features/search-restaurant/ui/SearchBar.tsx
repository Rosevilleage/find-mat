import { IconSearch, IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  variant?: "full" | "icon";
  isExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export function SearchBar({
  placeholder = "음식/가게 이름 검색",
  onSearch,
  onFilterClick,
  variant = "full",
  isExpanded = false,
  onExpand,
  onCollapse,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  // ESC 키로 검색창 닫기 (접근성)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded && variant === "icon") {
        onCollapse?.();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isExpanded, variant, onCollapse]);

  // 아이콘 모드 - 축소 상태
  if (variant === "icon" && !isExpanded) {
    return (
      <motion.button
        onClick={onExpand}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        aria-label="검색창 열기"
        aria-expanded={false}
      >
        <IconSearch className="w-5 h-5 text-muted-foreground" />
      </motion.button>
    );
  }

  // 아이콘 모드 - 확장 상태
  if (variant === "icon" && isExpanded) {
    return (
      <motion.form
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="flex-1 h-12 px-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
        />
        <motion.button
          type="button"
          onClick={onCollapse}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cursor-pointer"
          aria-label="검색창 닫기"
        >
          <IconX className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </motion.form>
    );
  }

  // 전체 모드 (기존 로직)
  return (
    <form onSubmit={handleSubmit} className="relative px-1">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pl-12 pr-12 bg-background rounded-2xl border-2 border-border focus:border-primary focus:outline-none transition-colors"
        />
        {onFilterClick && (
          <button
            type="button"
            onClick={onFilterClick}
            className="absolute right-3 p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <IconSearch className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </form>
  );
}
