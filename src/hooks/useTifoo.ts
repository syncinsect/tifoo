import type { useTifooProps } from "@/types";
import { useCallback, useRef, useState } from "react";

export const useTifoo = ({
  isActive,
  setHighlightedElement,
  setFloatingWindowPosition,
  setIsFloatingWindowFixed,
}: useTifooProps) => {
  const [lastHighlightedElement, setLastHighlightedElement] =
    useState<HTMLElement | null>(null);
  const isFloatingWindowFixedRef = useRef(false);
  const initialClickPositionRef = useRef({ x: 0, y: 0 });
  const floatingWindowPositionRef = useRef({ x: 0, y: 0 });

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      if (!isActive || isFloatingWindowFixedRef.current) return;
      const target = e.target as HTMLElement;
      setLastHighlightedElement(target);
      setHighlightedElement(target);
    },
    [isActive, setHighlightedElement]
  );

  const handleMouseOut = useCallback(() => {
    if (!isActive || isFloatingWindowFixedRef.current) return;
    setHighlightedElement(null);
  }, [isActive, setHighlightedElement]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;
      const target = e.target as HTMLElement;

      if (isFloatingWindowFixedRef.current) {
        if (
          !target.closest(".floating-window") &&
          !target.closest("tifoo-container")
        ) {
          unfixFloatingWindow();
        }
      } else {
        fixFloatingWindow(e);
      }
    },
    [isActive]
  );

  const fixFloatingWindow = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isFloatingWindowFixedRef.current = true;
      setIsFloatingWindowFixed(true);

      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      initialClickPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      const left = Math.round(floatingWindowPositionRef.current.x + scrollX);
      const top = Math.round(floatingWindowPositionRef.current.y + scrollY);

      setFloatingWindowPosition({ x: left, y: top });
    },
    [
      setIsFloatingWindowFixed,
      lastHighlightedElement,
      setFloatingWindowPosition,
    ]
  );

  const updateFloatingWindowPosition = useCallback(
    (e: MouseEvent) => {
      if (!isActive || isFloatingWindowFixedRef.current) return;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const floatingWindowWidth = 352; // 22rem
      const maxFloatingWindowHeight = 352 + 100; // 452px

      let left = e.clientX + 10;
      let top = e.clientY + 10;

      if (left + floatingWindowWidth > windowWidth) {
        left = windowWidth - floatingWindowWidth - 51;
      }

      if (top + maxFloatingWindowHeight > windowHeight) {
        top = e.clientY - maxFloatingWindowHeight - 10;
      }

      top = Math.max(0, top);

      floatingWindowPositionRef.current = { x: left, y: top };
      setFloatingWindowPosition({ x: left, y: top });
    },
    [isActive, setFloatingWindowPosition]
  );

  const unfixFloatingWindow = useCallback(() => {
    isFloatingWindowFixedRef.current = false;
    setIsFloatingWindowFixed(false);

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const left = Math.round(floatingWindowPositionRef.current.x - scrollX);
    const top = Math.round(floatingWindowPositionRef.current.y - scrollY);

    setFloatingWindowPosition({ x: left, y: top });

    floatingWindowPositionRef.current = { x: left, y: top };

    const mouseEvent = new MouseEvent("mousemove", {
      clientX: initialClickPositionRef.current.x,
      clientY: initialClickPositionRef.current.y,
    });
    updateFloatingWindowPosition(mouseEvent);
  }, [
    setIsFloatingWindowFixed,
    lastHighlightedElement,
    setFloatingWindowPosition,
    updateFloatingWindowPosition,
  ]);
  const handleScroll = useCallback(() => {
    if (isFloatingWindowFixedRef.current && lastHighlightedElement) {
      setHighlightedElement(lastHighlightedElement);
    }
  }, [lastHighlightedElement, setHighlightedElement]);

  const resetTifooState = useCallback(() => {
    setLastHighlightedElement(null);
    isFloatingWindowFixedRef.current = false;
    initialClickPositionRef.current = { x: 0, y: 0 };
    floatingWindowPositionRef.current = { x: 0, y: 0 };
  }, []);

  return {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    updateFloatingWindowPosition,
    isFloatingWindowFixed: isFloatingWindowFixedRef.current,
    handleScroll,
    resetTifooState,
  };
};
