import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing collapsible table rows
 * @returns Object containing state and methods for collapsible functionality
 */
export function useCollapsibleTable<T extends { id: string }>(data?: T[]) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [heights, setHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const heightsRef = useRef<Record<string, number>>({});

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      [id]: !prev[id],
    }));
  };

  const isOpen = (id: string) => openItems[id] || false;

  const setContentRef = (id: string, element: HTMLDivElement | null) => {
    contentRefs.current[id] = element;

    // Update height immediately when ref is set
    if (element) {
      const newHeight = element.scrollHeight;
      if (heightsRef.current[id] !== newHeight) {
        heightsRef.current[id] = newHeight;
        setHeights((prev) => ({
          ...prev,
          [id]: newHeight,
        }));
      }
    }
  };

  const getExpandableStyle = (id: string) => ({
    height: isOpen(id) ? `${heights[id] || 0}px` : "0px",
    opacity: isOpen(id) ? 1 : 0,
    overflow: "hidden" as const,
    transition: "height 0.3s ease, opacity 0.3s ease",
  });

  // Recalculate heights when data changes
  useEffect(() => {
    const updateHeights = () => {
      const newHeights: Record<string, number> = {};
      let hasChanges = false;

      Object.keys(contentRefs.current).forEach((id) => {
        const element = contentRefs.current[id];
        if (element) {
          const newHeight = element.scrollHeight;
          newHeights[id] = newHeight;
          if (heightsRef.current[id] !== newHeight) {
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        heightsRef.current = newHeights;
        setHeights(newHeights);
      }
    };

    // Use requestAnimationFrame to avoid synchronous state updates
    const rafId = requestAnimationFrame(updateHeights);

    return () => cancelAnimationFrame(rafId);
  }, [data]);

  return {
    openItems,
    toggleItem,
    isOpen,
    setContentRef,
    getExpandableStyle,
  };
}

export default useCollapsibleTable;
