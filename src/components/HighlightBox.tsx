import type { HighlightBoxProps } from "@/types";
import { getElementStyles, getAdjustedPosition } from "@/utils";
import { useElementInfo } from "@/hooks";
import React, { useEffect, useRef, useState, useCallback } from "react";
import BorderLine from "./BorderLine";

const HighlightBox: React.FC<HighlightBoxProps> = ({
  element,
  isFixed,
  animatedRect,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState({});
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const getElementInfo = useElementInfo(element);

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
          left: `${getAdjustedPosition(currentRect.left, "x", false, isFixed, elementOffset, currentRect, scrollPosition)}px`,
          top: `${getAdjustedPosition(currentRect.top, "y", false, isFixed, elementOffset, currentRect, scrollPosition)}px`,
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
      <BorderLine
        position="top"
        style={{
          top: `${getAdjustedPosition(currentRect.top, "y", false, isFixed, elementOffset, currentRect, scrollPosition)}px`,
        }}
        lineStyle={lineStyle}
      />
      <BorderLine
        position="bottom"
        style={{
          top: `${getAdjustedPosition(currentRect.bottom, "y", true, isFixed, elementOffset, currentRect, scrollPosition)}px`,
        }}
        lineStyle={lineStyle}
      />
      <BorderLine
        position="left"
        style={{
          left: `${getAdjustedPosition(currentRect.left, "x", false, isFixed, elementOffset, currentRect, scrollPosition)}px`,
        }}
        lineStyle={lineStyle}
      />
      <BorderLine
        position="right"
        style={{
          left: `${getAdjustedPosition(currentRect.right, "x", true, isFixed, elementOffset, currentRect, scrollPosition)}px`,
        }}
        lineStyle={lineStyle}
      />
    </div>
  );
};

export default HighlightBox;
