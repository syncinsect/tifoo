// src/content.tsx
import React, { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import FloatingWindow from "./components/FloatingWindow"
import HighlightBox from "./components/HighlightBox"
import Toast from "./components/Toast"
import useScanner from "./hooks/useScanner"
import { removeHighlight, updateHighlight } from "./utils/domUtils"

import "./styles/globals.css"

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(false)
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null)
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
  } = useScanner({
    isActive,
    setHighlightedElement,
    setFloatingWindowPosition,
    setIsFloatingWindowFixed
  })

  useEffect(() => {
    const handleMessage = (request: any) => {
      if (request.action === "toggleScanner") {
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
      updateHighlight(highlightedElement, null, isFloatingWindowFixed)
    }
  }, [highlightedElement, isFloatingWindowFixed])

  useEffect(() => {
    const handleScroll = () => {
      if (isFloatingWindowFixed && highlightedElement) {
        const rect = highlightedElement.getBoundingClientRect()
        updateHighlight(highlightedElement, rect, true)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isFloatingWindowFixed, highlightedElement])

  const handleDeactivate = () => {
    setIsActive(false)
    chrome.runtime.sendMessage({ action: "scannerDeactivated" })
  }

  const updateHighlightAndLines = useCallback(() => {
    if (highlightedElement) {
      const rect = highlightedElement.getBoundingClientRect()
      updateHighlight(highlightedElement, rect, isFloatingWindowFixed)
    }
  }, [highlightedElement, isFloatingWindowFixed])

  const handleClassChange = useCallback(() => {
    updateHighlightAndLines()
    if (window.Tailwind && typeof window.Tailwind.refresh === "function") {
      window.Tailwind.refresh()
    }
  }, [updateHighlightAndLines])

  return (
    <>
      {isActive && highlightedElement && (
        <>
          <HighlightBox
            element={highlightedElement}
            isFixed={isFloatingWindowFixed}
          />
          <FloatingWindow
            element={highlightedElement}
            position={floatingWindowPosition}
            isFixed={isFloatingWindowFixed}
            onDeactivate={handleDeactivate}
            onClassChange={handleClassChange}
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
