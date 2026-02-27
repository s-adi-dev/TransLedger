import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface UseVirtualizedInfiniteScrollOptions<T> {
  query: UseInfiniteQueryResult<T, Error>;
  enabled?: boolean;
  threshold?: number; // Distance from bottom to trigger load (in pixels)
}

/**
 * Reusable hook for infinite scroll with intersection observer
 * Works with TanStack Query's useInfiniteQuery
 */
export function useVirtualizedInfiniteScroll<T>({
  query,
  enabled = true,
  threshold = 300,
}: UseVirtualizedInfiniteScrollOptions<T>) {
  const observerRef = useRef<HTMLDivElement>(null);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  useEffect(() => {
    if (!enabled || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: `${threshold}px`,
      },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [enabled, fetchNextPage, hasNextPage, isFetchingNextPage, threshold]);

  return { observerRef };
}
