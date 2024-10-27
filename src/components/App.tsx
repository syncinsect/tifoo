import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useTailware, useClassManagement } from "@/hooks";
import FloatingWindow from "./FloatingWindow";
import HighlightBox from "./HighlightBox";
import Toast from "./Toast";

import "../styles/globals.css";

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const [animatedRect, setAnimatedRect] = useState<DOMRect | null>(null);
  const [floatingWindowPosition, setFloatingWindowPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isFloatingWindowFixed, setIsFloatingWindowFixed] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const updateHighlightAndLines = useCallback(() => {
    if (highlightedElement) {
      setAnimatedRect(highlightedElement.getBoundingClientRect());
      setHighlightedElement((prev) => prev);
    }
  }, [highlightedElement]);

  const {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    handleScroll,
    updateFloatingWindowPosition,
    resetTailwareState,
  } = useTailware({
    isActive,
    setHighlightedElement,
    setFloatingWindowPosition,
    setIsFloatingWindowFixed,
  });

  const { resetClassManagement } = useClassManagement(
    highlightedElement,
    updateHighlightAndLines
  );

  const resetAllState = useCallback(() => {
    setHighlightedElement(null);
    setAnimatedRect(null);
    setFloatingWindowPosition({ x: 0, y: 0 });
    setIsFloatingWindowFixed(false);
    setToastMessage("");

    resetTailwareState();
    resetClassManagement();
  }, []);

  const handleDeactivate = useCallback(() => {
    setIsActive(false);
    resetAllState();
    chrome.runtime.sendMessage({ action: "tailwareDeactivated" });
  }, [resetAllState]);

  useEffect(() => {
    const handleMessage = (request: any, sender: any, sendResponse: any) => {
      if (request.action === "toggleTailware") {
        setIsActive(request.isActive);
      } else if (request.action === "getState") {
        sendResponse({ isActive });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

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
  ]);
  useEffect(() => {
    if (!isActive) {
      resetAllState();
    }
  }, [isActive, resetAllState]);
  useEffect(() => {
    if (highlightedElement) {
      const startRect =
        animatedRect || highlightedElement.getBoundingClientRect();
      const endRect = highlightedElement.getBoundingClientRect();

      const animate = (progress: number) => {
        const currentRect = {
          left: startRect.left + (endRect.left - startRect.left) * progress,
          top: startRect.top + (endRect.top - startRect.top) * progress,
          width: startRect.width + (endRect.width - startRect.width) * progress,
          height:
            startRect.height + (endRect.height - startRect.height) * progress,
          right: startRect.right + (endRect.right - startRect.right) * progress,
          bottom:
            startRect.bottom + (endRect.bottom - startRect.bottom) * progress,
        } as DOMRect;
        setAnimatedRect(currentRect);
      };

      const duration = 200;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        animate(progress);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }
  }, [highlightedElement]);

  useEffect(() => {
    if (isActive) {
      const styleElement = document.createElement("style");
      styleElement.id = "tailware-injected-styles";
      document.head.appendChild(styleElement);
    } else {
      const styleElement = document.getElementById("tailware-injected-styles");
      if (styleElement) {
        styleElement.remove();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      resetAllState();
    }
  }, [isActive, resetAllState]);

  const handleExtensionError = (error: Error) => {
    if (error.message.includes("Extension context invalidated")) {
      console.warn("Extension context invalidated");

      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", updateFloatingWindowPosition);
      document.removeEventListener("click", handleClick, true);

      setHighlightedElement(null);
      setIsFloatingWindowFixed(false);

      setIsActive(false);

      try {
        chrome.runtime.sendMessage({ action: "tailwareDeactivated" });
      } catch (e) {
        console.warn("Cannot send message to background script:", e);
      }

      const tailwareRoot = document.getElementById("tailware-root");
      if (tailwareRoot) {
        tailwareRoot.remove();
      }
    } else {
      console.error("Unexpected error:", error);
    }
  };

  window.addEventListener("error", (event) =>
    handleExtensionError(event.error)
  );
  window.addEventListener("unhandledrejection", (event) =>
    handleExtensionError(event.reason)
  );

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
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </>
  );
};

export default App;
