"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Search } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface AutocompleteProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
  maxSuggestions?: number;
  caseSensitive?: boolean;
  highlightMatch?: boolean;
}

export default function Autocomplete({
  options = [],
  value = "",
  onChange,
  placeholder = "Search...",
  debounceDelay = 300,
  className = "",
  maxSuggestions = 10,
  caseSensitive = false,
  highlightMatch = true,
}: AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const debouncedQuery = useDebounce(query, debounceDelay);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Improved suggestion logic with ranking
  const suggestions = useMemo(() => {
    const searchQuery = debouncedQuery ?? "";

    if (!searchQuery.trim() || !isFocused) {
      return [];
    }

    const searchTerm = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    const rankedOptions = options
      .map((option) => {
        const optionText = caseSensitive ? option : option.toLowerCase();

        // Skip if no match
        if (!optionText.includes(searchTerm)) {
          return null;
        }

        // Calculate relevance score
        let score = 0;

        // Exact match gets highest score
        if (optionText === searchTerm) {
          score = 1000;
        }
        // Starts with query gets high score
        else if (optionText.startsWith(searchTerm)) {
          score = 500;
        }
        // Word boundary match gets medium score
        else if (
          new RegExp(
            `\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            "i",
          ).test(optionText)
        ) {
          score = 250;
        }
        // Contains query gets base score
        else {
          score = 100;
        }

        // Boost score for shorter options (more specific)
        score += 1000 - option.length;

        return { option, score };
      })
      .filter(
        (item): item is { option: string; score: number } => item !== null,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map((item) => item.option);

    return rankedOptions;
  }, [debouncedQuery, isFocused, options, maxSuggestions, caseSensitive]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const selected = suggestions[selectedIndex];
        setQuery(selected);
        onChange?.(selected);
        setIsFocused(false);
      }
      setSelectedIndex(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === "Tab" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      setQuery(selected);
      onChange?.(selected);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onChange?.(suggestion);
    setSelectedIndex(-1);
    setIsFocused(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlightMatch || !highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }

    const searchTerm = caseSensitive ? highlight : highlight.toLowerCase();
    const textToSearch = caseSensitive ? text : text.toLowerCase();
    const index = textToSearch.indexOf(searchTerm);

    if (index === -1) {
      return <span>{text}</span>;
    }

    const before = text.slice(0, index);
    const match = text.slice(index, index + highlight.length);
    const after = text.slice(index + highlight.length);

    return (
      <span>
        {before}
        <span className="font-semibold text-foreground">{match}</span>
        {after}
      </span>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const showDropdown = isFocused && (suggestions.length > 0 || (debouncedQuery && debouncedQuery.trim()));

  // Use layoutEffect for synchronous position calculation before paint
  useLayoutEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
    }
  }, [showDropdown, updateDropdownPosition]);

  useEffect(() => {
    if (showDropdown) {
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [showDropdown, updateDropdownPosition]);

  const dropdownStyle: React.CSSProperties = dropdownPos ? {
    position: "fixed",
    top: dropdownPos.top,
    left: dropdownPos.left,
    width: dropdownPos.width,
    zIndex: 9999,
  } : { position: "fixed", top: -9999, left: -9999, zIndex: 9999 };

  const dropdownContent = mounted && suggestions.length > 0 ? (
    <ul
      ref={listRef}
      id="suggestions-list"
      style={dropdownStyle}
      className="max-h-60 overflow-y-auto bg-popover text-popover-foreground border rounded-md shadow-md"
      role="listbox"
    >
      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion}-${index}`}
          id={`suggestion-${index}`}
          className={`px-4 py-2 cursor-pointer hover:bg-muted transition-colors ${
            index === selectedIndex ? "bg-muted" : ""
          }`}
          onClick={() => handleSuggestionClick(suggestion)}
          onMouseEnter={() => setSelectedIndex(index)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          {highlightText(suggestion, debouncedQuery ?? "")}
        </li>
      ))}
    </ul>
  ) : mounted && isFocused && debouncedQuery && debouncedQuery.trim() && suggestions.length === 0 ? (
    <div
      style={dropdownStyle}
      className="px-4 py-3 bg-popover border rounded-md shadow-md text-sm text-muted-foreground"
    >
      No results found
    </div>
  ) : null;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="pr-10"
          aria-label="Search input"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={suggestions.length > 0}
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full pointer-events-none"
          aria-label="Search"
          tabIndex={-1}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
}
