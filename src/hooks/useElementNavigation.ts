import { useCallback } from "react";

export interface DOMPathItem {
  element: HTMLElement;
  tagName: string;
  className?: string;
  id?: string;
  index: number;
}

export const useElementNavigation = (element: HTMLElement | null) => {
  const getParentElement = useCallback(() => {
    if (!element) return null;
    const parent = element.parentElement;
    return parent && parent !== document.body ? parent : null;
  }, [element]);

  const getDOMPath = useCallback((maxDepth: number = 3): DOMPathItem[] => {
    if (!element) return [];
    
    const path: DOMPathItem[] = [];
    let currentElement: HTMLElement | null = element;
    let depth = 0;
    
    while (currentElement && depth < maxDepth) {
      // Skip body and html elements
      if (currentElement === document.body || currentElement === document.documentElement) {
        currentElement = currentElement.parentElement;
        continue;
      }
      
      const tagName = currentElement.tagName.toLowerCase();
      const className = currentElement.className ? currentElement.className.split(' ')[0] : undefined;
      const id = currentElement.id || undefined;
      
      path.unshift({
        element: currentElement,
        tagName,
        className,
        id,
        index: depth,
      });
      
      currentElement = currentElement.parentElement;
      depth++;
    }
    
    return path;
  }, [element]);

  return {
    getParentElement,
    getDOMPath,
  };
};
