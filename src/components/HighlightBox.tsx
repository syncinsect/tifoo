import type { HighlightBoxProps } from "@/types";
import { getElementStyles } from "@/utils/domUtils";
import React, { useEffect, useRef, useState, useCallback } from "react";

const HighlightBox: React.FC<HighlightBoxProps> = ({
  element,
  isFixed,
  animatedRect,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const getElementInfo = useCallback(() => {
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

  const updateBox = useCallback(() => {
    if (element) {
      requestAnimationFrame(() => {
        forceUpdate({});
      });
    }
  }, [element]);

  useEffect(() => {
    updateBox();
    const resizeObserver = new ResizeObserver(updateBox);
    if (element) {
      resizeObserver.observe(element);
      resizeObserver.observe(document.body);

      mutationObserverRef.current = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            (mutation.attributeName === "style" ||
              mutation.attributeName === "class")
          ) {
            updateBox();
          }
        });
      });

      mutationObserverRef.current.observe(element, {
        attributes: true,
        attributeFilter: ["style", "class"],
        subtree: true,
      });
    }

    window.addEventListener("resize", updateBox);
    window.addEventListener("scroll", updateBox);

    return () => {
      resizeObserver.disconnect();
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
      window.removeEventListener("resize", updateBox);
      window.removeEventListener("scroll", updateBox);
    };
  }, [element, updateBox]);

  const elementInfo = getElementInfo();
  if (!elementInfo) return null;

  const {
    rect: currentRect,
    scrollPosition,
    elementOffset,
    pageHeight,
  } = elementInfo;
  const styles = getElementStyles(element);

  const lineStyle = isFixed
    ? "border-blue-500 border-solid"
    : "border-blue-500 border-dashed";

  const containerStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: `${pageHeight}px`,
    width: "100%",
  };

  const getAdjustedPosition = (
    pos: number,
    axis: "x" | "y",
    isEnd: boolean = false
  ) => {
    let adjustedPos;
    if (isFixed) {
      adjustedPos = axis === "y" ? elementOffset.top : elementOffset.left;
      if (isEnd) {
        adjustedPos += axis === "y" ? currentRect.height : currentRect.width;
      }
    } else {
      adjustedPos = pos + (axis === "y" ? scrollPosition.y : scrollPosition.x);
    }
    return adjustedPos;
  };

  const transitionStyle = "transition-all duration-200 ease-in-out";

  return (
    <div
      className={`pointer-events-none z-[9997] ${transitionStyle}`}
      style={containerStyle}
    >
      <div
        ref={boxRef}
        className={`absolute pointer-events-none z-[9998] ${transitionStyle}`}
        style={{
          left: `${getAdjustedPosition(currentRect.left, "x")}px`,
          top: `${getAdjustedPosition(currentRect.top, "y")}px`,
          width: `${currentRect.width}px`,
          height: `${currentRect.height}px`,
        }}
      >
        <div
          className={`absolute inset-0 ${transitionStyle}`}
          style={{
            left: `-${styles.margin.left}px`,
            top: `-${styles.margin.top}px`,
            right: `-${styles.margin.right}px`,
            bottom: `-${styles.margin.bottom}px`,
            backgroundColor: "rgba(246, 178, 107, 0.3)",
          }}
        />
        <div
          className={`absolute inset-0 ${transitionStyle}`}
          style={{
            backgroundColor: "rgba(147, 196, 125, 0.3)",
          }}
        />
        <div
          className={`absolute ${transitionStyle}`}
          style={{
            left: `${styles.padding.left}px`,
            top: `${styles.padding.top}px`,
            right: `${styles.padding.right}px`,
            bottom: `${styles.padding.bottom}px`,
            backgroundColor: "rgba(59, 130, 246, 0.3)",
            zIndex: 1,
          }}
        />
      </div>
      <div
        className={`absolute left-0 right-0 ${lineStyle} border-t-2 ${transitionStyle}`}
        style={{
          top: `${getAdjustedPosition(currentRect.top, "y")}px`,
        }}
      />
      <div
        className={`absolute left-0 right-0 ${lineStyle} border-t-2 ${transitionStyle}`}
        style={{
          top: `${getAdjustedPosition(currentRect.bottom, "y", true)}px`,
          transform: "translateY(-100%)",
        }}
      />
      <div
        className={`absolute top-0 bottom-0 ${lineStyle} border-l-2 ${transitionStyle}`}
        style={{
          left: `${getAdjustedPosition(currentRect.left, "x")}px`,
        }}
      />
      <div
        className={`absolute top-0 bottom-0 ${lineStyle} border-l-2 ${transitionStyle}`}
        style={{
          left: `${getAdjustedPosition(currentRect.right, "x", true)}px`,
          transform: "translateX(-100%)",
        }}
      />
    </div>
  );
};

export default HighlightBox;
