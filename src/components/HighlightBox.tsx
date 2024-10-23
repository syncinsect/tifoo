import type { HighlightBoxProps } from "@/types"
import { getElementStyles } from "@/utils/domUtils"
import React, { useEffect, useRef, useState } from "react"

const HighlightBox: React.FC<HighlightBoxProps> = ({
  element,
  isFixed,
  animatedRect
}) => {
  const boxRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [pageHeight, setPageHeight] = useState(document.body.scrollHeight)
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const fixedScrollPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updateBox = () => {
      if (element) {
        const newRect = element.getBoundingClientRect()
        const scrollX =
          window.pageXOffset || document.documentElement.scrollLeft
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        setRect({
          top: newRect.top,
          left: newRect.left,
          bottom: newRect.bottom,
          right: newRect.right,
          width: newRect.width,
          height: newRect.height
        } as DOMRect)
        setPageHeight(Math.max(document.body.scrollHeight, window.innerHeight))
        setScrollPosition({ x: scrollX, y: scrollY })

        if (
          isFixed &&
          fixedScrollPositionRef.current.x === 0 &&
          fixedScrollPositionRef.current.y === 0
        ) {
          fixedScrollPositionRef.current = { x: scrollX, y: scrollY }
        }
      }
    }

    updateBox()
    window.addEventListener("resize", updateBox)
    window.addEventListener("scroll", updateBox)

    return () => {
      window.removeEventListener("resize", updateBox)
      window.removeEventListener("scroll", updateBox)
    }
  }, [element, isFixed])

  useEffect(() => {
    if (!isFixed) {
      fixedScrollPositionRef.current = { x: 0, y: 0 }
    }
  }, [isFixed])

  const currentRect = animatedRect || rect

  if (!currentRect) return null

  const styles = getElementStyles(element)

  const lineStyle = isFixed
    ? "border-blue-500 border-solid"
    : "border-blue-500 border-dashed"

  const containerStyle = isFixed
    ? {
        position: "absolute" as const,
        top: 0,
        left: 0,
        height: `${pageHeight}px`,
        width: "100%"
      }
    : {
        position: "absolute" as const,
        top: 0,
        left: `${scrollPosition.x}px`,
        height: `${pageHeight}px`,
        width: "100%"
      }

  const getAdjustedPosition = (pos: number, axis: "x" | "y") => {
    if (isFixed) {
      return pos + fixedScrollPositionRef.current[axis]
    } else {
      return pos + scrollPosition[axis]
    }
  }

  return (
    <div className="pointer-events-none z-[9997]" style={containerStyle}>
      <div
        ref={boxRef}
        className="absolute pointer-events-none z-[9998]"
        style={{
          left: `${getAdjustedPosition(currentRect.left, "x")}px`,
          top: `${getAdjustedPosition(currentRect.top, "y")}px`,
          width: `${currentRect.width}px`,
          height: `${currentRect.height}px`
        }}>
        <div
          className="absolute inset-0"
          style={{
            left: `-${styles.margin.left}px`,
            top: `-${styles.margin.top}px`,
            right: `-${styles.margin.right}px`,
            bottom: `-${styles.margin.bottom}px`,
            backgroundColor: "rgba(246, 178, 107, 0.3)"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(147, 196, 125, 0.3)"
          }}
        />
        <div
          className="absolute"
          style={{
            left: `${styles.padding.left}px`,
            top: `${styles.padding.top}px`,
            right: `${styles.padding.right}px`,
            bottom: `${styles.padding.bottom}px`,
            backgroundColor: "rgba(59, 130, 246, 0.3)",
            zIndex: 1
          }}
        />
      </div>
      <div
        className={`absolute left-0 right-0 ${lineStyle} border-t-2`}
        style={{ top: `${getAdjustedPosition(currentRect.top, "y")}px` }}
      />
      <div
        className={`absolute left-0 right-0 ${lineStyle} border-t-2`}
        style={{ top: `${getAdjustedPosition(currentRect.bottom, "y")}px` }}
      />
      <div
        className={`absolute top-0 bottom-0 ${lineStyle} border-l-2`}
        style={{ left: `${getAdjustedPosition(currentRect.left, "x")}px` }}
      />
      <div
        className={`absolute top-0 bottom-0 ${lineStyle} border-l-2`}
        style={{ left: `${getAdjustedPosition(currentRect.right, "x")}px` }}
      />
    </div>
  )
}

export default HighlightBox
