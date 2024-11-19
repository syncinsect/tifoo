import { useState, useCallback } from "react";

export const useTifooState = () => {
  const [isActive, setIsActive] = useState(false);
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const [animatedRect, setAnimatedRect] = useState<DOMRect | null>(null);
  const [floatingWindowPosition, setFloatingWindowPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isFloatingWindowFixed, setIsFloatingWindowFixed] = useState(false);

  const resetAllState = useCallback(() => {
    setHighlightedElement(null);
    setAnimatedRect(null);
    setFloatingWindowPosition({ x: 0, y: 0 });
    setIsFloatingWindowFixed(false);
  }, []);

  return {
    isActive,
    setIsActive,
    highlightedElement,
    setHighlightedElement,
    animatedRect,
    setAnimatedRect,
    floatingWindowPosition,
    setFloatingWindowPosition,
    isFloatingWindowFixed,
    setIsFloatingWindowFixed,
    resetAllState,
  };
};
