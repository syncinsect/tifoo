import { useEffect } from "react";

export const useEventListeners = (
  isActive: boolean,
  handleMouseOver: (event: MouseEvent) => void,
  handleMouseOut: (event: MouseEvent) => void,
  handleScroll: () => void,
  updateFloatingWindowPosition: (event: MouseEvent) => void,
  handleClick: (event: MouseEvent) => void,
  setHighlightedElement: (element: HTMLElement | null) => void,
  setIsFloatingWindowFixed: (isFixed: boolean) => void
) => {
  useEffect(() => {
    if (isActive) {
      document.addEventListener("mouseover", handleMouseOver);
      document.addEventListener("mouseout", handleMouseOut);
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("mousemove", updateFloatingWindowPosition);
      document.addEventListener("click", handleClick, true);
    } else {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", updateFloatingWindowPosition);
      document.removeEventListener("click", handleClick, true);
      setHighlightedElement(null);
      setIsFloatingWindowFixed(false);
    }

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", updateFloatingWindowPosition);
      document.removeEventListener("click", handleClick, true);
    };
  }, [
    isActive,
    handleMouseOver,
    handleMouseOut,
    handleScroll,
    updateFloatingWindowPosition,
    handleClick,
    setHighlightedElement,
    setIsFloatingWindowFixed,
  ]);
};
