import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
}

export function SearchBar({
  placeholder = "음식/가게 이름 검색",
  onSearch,
  onFilterClick,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

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
            className="absolute right-3 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <IconSearch className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </form>
  );
}
