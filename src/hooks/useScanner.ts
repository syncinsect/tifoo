// src/hooks/useScanner.ts
import { useCallback, useState } from "react"

import { removeHighlight, updateHighlight } from "../utils/domUtils"

interface UseScannerProps {
  isActive: boolean
  setHighlightedElement: (element: HTMLElement | null) => void
  setFloatingWindowPosition: (position: { x: number; y: number }) => void
  setIsFloatingWindowFixed: (isFixed: boolean) => void
}

const useScanner = ({
  isActive,
  setHighlightedElement,
  setFloatingWindowPosition,
  setIsFloatingWindowFixed
}: UseScannerProps) => {
  const [lastHighlightedElement, setLastHighlightedElement] =
    useState<HTMLElement | null>(null)

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return
      const target = e.target as HTMLElement
      setLastHighlightedElement(target)
      setHighlightedElement(target)
      updateHighlight(target)
    },
    [isActive, setHighlightedElement]
  )

  const handleMouseOut = useCallback(() => {
    if (!isActive) return
    removeHighlight()
    setHighlightedElement(null)
  }, [isActive, setHighlightedElement])

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return
      e.preventDefault()
      e.stopPropagation()
      const target = e.target as HTMLElement
      setLastHighlightedElement(target)
      setHighlightedElement(target)
      setIsFloatingWindowFixed(true)
      updateHighlight(target, null, true)
    },
    [isActive, setHighlightedElement, setIsFloatingWindowFixed]
  )

  const handleScroll = useCallback(() => {
    if (lastHighlightedElement) {
      const rect = lastHighlightedElement.getBoundingClientRect()
      updateHighlight(lastHighlightedElement, rect)
    }
  }, [lastHighlightedElement])

  const updateFloatingWindowPosition = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return
      const x = e.clientX + 10
      const y = e.clientY + 10
      setFloatingWindowPosition({ x, y })
    },
    [isActive, setFloatingWindowPosition]
  )

  return {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    handleScroll,
    updateFloatingWindowPosition
  }
}

export default useScanner
