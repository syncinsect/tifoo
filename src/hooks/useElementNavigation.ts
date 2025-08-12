import { useCallback } from "react";

export const useElementNavigation = (element: HTMLElement | null) => {
  const getParentElement = useCallback(() => {
    if (!element) return null;
    const parent = element.parentElement;
    return parent && parent !== document.body ? parent : null;
  }, [element]);

  return {
    getParentElement,
  };
};
