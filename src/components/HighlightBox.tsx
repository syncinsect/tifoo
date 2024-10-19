// src/components/HighlightBox.tsx
import React, { useEffect, useRef } from "react"

import { getElementStyles } from "../utils/domUtils"

interface HighlightBoxProps {
  element: HTMLElement
  isFixed: boolean
}

const HighlightBox: React.FC<HighlightBoxProps> = ({ element, isFixed }) => {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateBox = () => {
      if (boxRef.current) {
        const rect = element.getBoundingClientRect()
        const styles = getElementStyles(element)

        boxRef.current.style.left = `${rect.left}px`
        boxRef.current.style.top = `${rect.top}px`
        boxRef.current.style.width = `${rect.width}px`
        boxRef.current.style.height = `${rect.height}px`

        // Update margin highlight
        const marginBox = boxRef.current.querySelector(
          ".margin-box"
        ) as HTMLElement
        if (marginBox) {
          marginBox.style.left = `-${styles.margin.left}px`
          marginBox.style.top = `-${styles.margin.top}px`
          marginBox.style.right = `-${styles.margin.right}px`
          marginBox.style.bottom = `-${styles.margin.bottom}px`
        }

        // Update padding highlight
        const paddingBox = boxRef.current.querySelector(
          ".padding-box"
        ) as HTMLElement
        if (paddingBox) {
          paddingBox.style.left = `${styles.padding.left}px`
          paddingBox.style.top = `${styles.padding.top}px`
          paddingBox.style.right = `${styles.padding.right}px`
          paddingBox.style.bottom = `${styles.padding.bottom}px`
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
  }, [element])

  return (
    <div
      ref={boxRef}
      className={`fixed pointer-events-none z-[9998] ${
        isFixed
          ? "border-2 border-blue-500"
          : "border border-blue-500 border-dashed"
      }`}>
      <div className="absolute inset-0 bg-yellow-500 opacity-20 margin-box" />
      <div className="absolute bg-green-500 opacity-20 padding-box" />
      <div className="absolute inset-0 bg-blue-500 opacity-20" />
    </div>
  )
}

export default HighlightBox
