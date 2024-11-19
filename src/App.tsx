import React, { useCallback } from "react";

import {
  useTifoo,
  useTifooState,
  useAnimationEffect,
  useMessageListener,
  useEventListeners,
  useStyleInjection,
  useClassManagement,
} from "@/hooks";
import { FloatingWindow, HighlightBox, Toast } from "@/components";

import "@/styles";

const App: React.FC = () => {
  const {
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
  } = useTifooState();

  const {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    handleScroll,
    updateFloatingWindowPosition,
    resetTifooState,
  } = useTifoo({
    isActive,
    setHighlightedElement,
    setFloatingWindowPosition,
    setIsFloatingWindowFixed,
  });

  const updateHighlightAndLines = useCallback(() => {
    if (highlightedElement) {
      setAnimatedRect(highlightedElement.getBoundingClientRect());
      setHighlightedElement((prev: HTMLElement) => prev);
    }
  }, [highlightedElement, setAnimatedRect, setHighlightedElement]);

  const { resetClassManagement } = useClassManagement(
    highlightedElement,
    updateHighlightAndLines
  );

  const handleDeactivate = useCallback(() => {
    setIsActive(false);
    resetAllState();
    resetTifooState();
    resetClassManagement();
    chrome.runtime.sendMessage({ action: "tifooDeactivated" });
  }, [resetAllState, setIsActive, resetTifooState, resetClassManagement]);

  useMessageListener(
    setIsActive,
    isActive,
    resetAllState,
    resetTifooState,
    resetClassManagement
  );

  useEventListeners(
    isActive,
    handleMouseOver,
    handleMouseOut,
    handleScroll,
    updateFloatingWindowPosition,
    handleClick,
    setHighlightedElement,
    setIsFloatingWindowFixed
  );

  useAnimationEffect(highlightedElement, animatedRect, setAnimatedRect);

  useStyleInjection(isActive);

  return (
    <>
      {isActive && highlightedElement && (
        <>
          <HighlightBox
            element={highlightedElement}
            isFixed={isFloatingWindowFixed}
            animatedRect={animatedRect}
          />
          <FloatingWindow
            element={highlightedElement}
            position={floatingWindowPosition}
            isFixed={isFloatingWindowFixed}
            onDeactivate={handleDeactivate}
            onClassChange={updateHighlightAndLines}
            setPosition={setFloatingWindowPosition}
          />
        </>
      )}
    </>
  );
};

export default App;
