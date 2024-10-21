// src/content.tsx
import React, { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import FloatingWindow from "./components/FloatingWindow"
import HighlightBox from "./components/HighlightBox"
import Toast from "./components/Toast"
import useTailware from "./hooks/useTailware"
import { removeHighlight } from "./utils/domUtils"

import "./styles/globals.css"

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false)
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null)
  const [animatedRect, setAnimatedRect] = useState<DOMRect | null>(null)
  const [floatingWindowPosition, setFloatingWindowPosition] = useState({
    x: 0,
    y: 0
  })
  const [isFloatingWindowFixed, setIsFloatingWindowFixed] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    handleScroll,
    updateFloatingWindowPosition
  } = useTailware({
    isActive,
    setHighlightedElement,
    setFloatingWindowPosition,
    setIsFloatingWindowFixed
  })

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.action === "toggleTailware") {
        setIsActive(request.isActive)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  useEffect(() => {
    if (isActive) {
      document.addEventListener("mouseover", handleMouseOver)
      document.addEventListener("mouseout", handleMouseOut)
      window.addEventListener("scroll", handleScroll, { passive: true })
      document.addEventListener("mousemove", updateFloatingWindowPosition)
      document.addEventListener("click", handleClick, true)
    } else {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousemove", updateFloatingWindowPosition)
      document.removeEventListener("click", handleClick, true)
      removeHighlight()
      setHighlightedElement(null)
      setIsFloatingWindowFixed(false)
    }

    return () => {
      document.removeEventListener("mouseover", handleMouseOver)
      document.removeEventListener("mouseout", handleMouseOut)
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mousemove", updateFloatingWindowPosition)
      document.removeEventListener("click", handleClick, true)
    }
  }, [isActive])

  useEffect(() => {
    if (highlightedElement) {
      const startRect =
        animatedRect || highlightedElement.getBoundingClientRect()
      const endRect = highlightedElement.getBoundingClientRect()

      const animate = (progress: number) => {
        const currentRect = {
          left: startRect.left + (endRect.left - startRect.left) * progress,
          top: startRect.top + (endRect.top - startRect.top) * progress,
          width: startRect.width + (endRect.width - startRect.width) * progress,
          height:
            startRect.height + (endRect.height - startRect.height) * progress,
          right: startRect.right + (endRect.right - startRect.right) * progress,
          bottom:
            startRect.bottom + (endRect.bottom - startRect.bottom) * progress
        } as DOMRect
        setAnimatedRect(currentRect)
      }

      const duration = 300
      const startTime = performance.now()

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        animate(progress)
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }

      requestAnimationFrame(step)
    }
  }, [highlightedElement])

  const handleDeactivate = () => {
    setIsActive(false)
    chrome.runtime.sendMessage({ action: "tailwareDeactivated" })
  }

  const updateHighlightAndLines = useCallback(() => {
    if (highlightedElement) {
      setAnimatedRect(highlightedElement.getBoundingClientRect())
      setHighlightedElement((prev) => prev)
    }
  }, [highlightedElement])

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
          />
        </>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </>
  )
}

const root = document.createElement("div")
root.id = "tailware-root"
document.body.appendChild(root)
createRoot(root).render(<App />)
