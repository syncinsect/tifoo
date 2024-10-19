// src/hooks/useScanner.ts
import { useCallback, useRef, useState } from "react"

import {
  removeHighlight,
  throttledUpdateHighlight,
  updateHighlight
} from "../utils/domUtils"

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
  const isFloatingWindowFixedRef = useRef(false)
  const initialClickPositionRef = useRef({ x: 0, y: 0 })
  const floatingWindowPositionRef = useRef({ x: 0, y: 0 })

  const handleMouseOver = useCallback(
    (e: MouseEvent) => {
      if (!isActive || isFloatingWindowFixedRef.current) return
      const target = e.target as HTMLElement
      setLastHighlightedElement(target)
      setHighlightedElement(target)
      throttledUpdateHighlight(target, isFloatingWindowFixedRef.current)
    },
    [isActive, setHighlightedElement]
  )

  const handleMouseOut = useCallback(() => {
    if (!isActive || isFloatingWindowFixedRef.current) return
    removeHighlight()
    setHighlightedElement(null)
  }, [isActive, setHighlightedElement])

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return
      const target = e.target as HTMLElement
      if (isFloatingWindowFixedRef.current) {
        if (!target.closest(".floating-window")) {
          unfixFloatingWindow()
        }
      } else {
        fixFloatingWindow(e)
      }
    },
    [isActive]
  )

  const fixFloatingWindow = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isFloatingWindowFixedRef.current = true
      setIsFloatingWindowFixed(true)

      const scrollX = window.pageXOffset || document.documentElement.scrollLeft
      const scrollY = window.pageYOffset || document.documentElement.scrollTop

      initialClickPositionRef.current = {
        x: e.clientX,
        y: e.clientY
      }

      const left = Math.round(floatingWindowPositionRef.current.x + scrollX)
      const top = Math.round(floatingWindowPositionRef.current.y + scrollY)

      setFloatingWindowPosition({ x: left, y: top })

      if (lastHighlightedElement) {
        updateHighlight(lastHighlightedElement, null, true)
      }
    },
    [
      setIsFloatingWindowFixed,
      lastHighlightedElement,
      setFloatingWindowPosition
    ]
  )

  const unfixFloatingWindow = useCallback(() => {
    isFloatingWindowFixedRef.current = false
    setIsFloatingWindowFixed(false)

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft
    const scrollY = window.pageYOffset || document.documentElement.scrollTop

    const left = Math.round(floatingWindowPositionRef.current.x - scrollX)
    const top = Math.round(floatingWindowPositionRef.current.y - scrollY)

    setFloatingWindowPosition({ x: left, y: top })

    if (lastHighlightedElement) {
      updateHighlight(lastHighlightedElement, null, false)
    }

    const mouseEvent = new MouseEvent("mousemove", {
      clientX: initialClickPositionRef.current.x,
      clientY: initialClickPositionRef.current.y
    })
    updateFloatingWindowPosition(mouseEvent)
  }, [
    setIsFloatingWindowFixed,
    lastHighlightedElement,
    setFloatingWindowPosition
  ])

  const updateFloatingWindowPosition = useCallback(
    (e: MouseEvent) => {
      if (!isActive || isFloatingWindowFixedRef.current) return
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const floatingWindowWidth = 352 // 22rem
      const floatingWindowHeight = 300 // 估计值，可能需要调整

      let left = e.clientX + 10
      let top = e.clientY + 10

      if (left + floatingWindowWidth > windowWidth) {
        left = e.clientX - floatingWindowWidth - 10
      }
      if (top + floatingWindowHeight > windowHeight) {
        top = e.clientY - floatingWindowHeight - 10
      }

      floatingWindowPositionRef.current = { x: left, y: top }
      setFloatingWindowPosition({ x: left, y: top })
    },
    [isActive, setFloatingWindowPosition]
  )

  const handleScroll = useCallback(() => {
    if (isFloatingWindowFixedRef.current && lastHighlightedElement) {
      const rect = lastHighlightedElement.getBoundingClientRect()
      updateHighlight(lastHighlightedElement, rect, true)
    }
  }, [lastHighlightedElement])

  return {
    handleMouseOver,
    handleMouseOut,
    handleClick,
    updateFloatingWindowPosition,
    isFloatingWindowFixed: isFloatingWindowFixedRef.current,
    handleScroll
  }
}

export default useScanner
