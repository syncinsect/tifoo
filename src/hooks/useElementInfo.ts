import { useCallback } from "react";

export const useElementInfo = (element: HTMLElement | null) => {
  return useCallback(() => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    return {
      rect,
      scrollPosition: { x: scrollX, y: scrollY },
      elementOffset: { top: rect.top + scrollY, left: rect.left + scrollX },
      pageHeight: Math.max(document.body.scrollHeight, window.innerHeight),
    };
  }, [element]);
};
