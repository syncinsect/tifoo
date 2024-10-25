import ClassTag from "@/components/ClassTag"
import Toast from "@/components/Toast"
import type { FloatingWindowProps } from "@/types"
import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses
} from "@/utils/tailwindUtils"
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from "@headlessui/react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onDeactivate,
  onClassChange
}) => {
  const [classes, setClasses] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [autocompleteResults, setAutocompleteResults] = useState<
    { c: string; p: string }[]
  >([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(0)

  useEffect(() => {
    setClasses(identifyTailwindClasses(element))
  }, [element])

  useEffect(() => {
    if (query.trim() === "") {
      setAutocompleteResults([])
    } else {
      const matches = searchTailwindClasses(query)
      setAutocompleteResults(matches)
    }
  }, [query])

  useEffect(() => {
    if (autocompleteResults.length > 0) {
      setFocusedOptionIndex(0)
    } else {
      setFocusedOptionIndex(-1)
    }
  }, [autocompleteResults])

  const handleAddClass = useCallback(
    (newClass: string | null) => {
      if (!newClass) return
      const trimmedClass = newClass.trim()
      if (trimmedClass === "") return

      if (!element.classList.contains(trimmedClass)) {
        applyTailwindStyle(element, trimmedClass)
        setClasses((prevClasses) => {
          if (!prevClasses.includes(trimmedClass)) {
            return [...prevClasses, trimmedClass]
          }
          return prevClasses
        })
        onClassChange()
      }

      setQuery("")
    },
    [element, onClassChange]
  )

  const handleRemoveClass = (classToRemove: string) => {
    element.classList.remove(classToRemove)
    removeTailwindStyle(element, classToRemove)
    setClasses(classes.filter((c) => c !== classToRemove))
    onClassChange()
    refreshTailwind()
  }

  const handleClassToggle = (className: string, isChecked: boolean) => {
    if (isChecked) {
      applyTailwindStyle(element, className)
    } else {
      removeTailwindStyle(element, className)
    }
    onClassChange()
    refreshTailwind()
  }

  const handleCopyClasses = () => {
    const classesString = classes.join(" ")
    navigator.clipboard
      .writeText(classesString)
      .then(() => {
        setToastMessage("Classes copied to clipboard!")
      })
      .catch(() => setToastMessage("Failed to copy classes"))
  }

  const handleCopyElement = () => {
    const elementString = element.outerHTML
    navigator.clipboard
      .writeText(elementString)
      .then(() => {
        setToastMessage("Element copied to clipboard!")
      })
      .catch(() => setToastMessage("Failed to copy element"))
  }

  const memoizedClasses = useMemo(() => classes, [classes.join(",")])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim() !== "") {
      event.preventDefault()
      if (focusedOptionIndex >= 0 && autocompleteResults.length > 0) {
        handleAddClass(autocompleteResults[focusedOptionIndex].c)
      } else {
        handleAddClass(query.trim())
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setFocusedOptionIndex((prev) =>
        prev >= autocompleteResults.length - 1 ? 0 : prev + 1
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setFocusedOptionIndex((prev) =>
        prev <= 0 ? autocompleteResults.length - 1 : prev - 1
      )
    }
  }

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const floatingWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const adjustedPosition = useMemo(() => {
    if (!floatingWindowRef.current) return position

    const floatingWindowRect = floatingWindowRef.current.getBoundingClientRect()
    const safetyMargin = 20

    let adjustedX = position.x
    let adjustedY = position.y

    if (
      adjustedX + floatingWindowRect.width >
      windowDimensions.width - safetyMargin
    ) {
      adjustedX =
        windowDimensions.width - floatingWindowRect.width - safetyMargin
    }

    adjustedX = Math.max(safetyMargin, adjustedX)

    if (
      adjustedY + floatingWindowRect.height >
      windowDimensions.height - safetyMargin
    ) {
      adjustedY =
        windowDimensions.height - floatingWindowRect.height - safetyMargin
    }

    adjustedY = Math.max(safetyMargin, adjustedY)

    return { x: adjustedX, y: adjustedY }
  }, [position, windowDimensions])

  return (
    <div
      ref={floatingWindowRef}
      className={`floating-window border-none bg-white shadow-lg ${
        isFixed ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        position: isFixed ? "absolute" : "fixed",
        zIndex: 2147483647
      }}>
      <div className="flex px-3 pt-3 justify-between items-center mb-3 pb-2 border-b border-[#1DA1F2] bg-[#1DA1F2] text-white p-2 rounded-t-lg">
        <span className="font-righteous text-sm">Tailware</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopyClasses}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Copy Classes">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            onClick={handleCopyElement}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Copy Element">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>
          <button
            onClick={onDeactivate}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Deactivate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="px-3 pb-3">
        <div className="bg-[#E8F5FE] text-[#1DA1F2] p-1.5 rounded text-xs mb-2 font-bold">
          {element.tagName.toLowerCase()}
        </div>
        <div className="h-80 overflow-auto">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {memoizedClasses.map((cls) => (
              <ClassTag
                key={cls}
                className={cls}
                element={element}
                onToggle={handleClassToggle}
                onRemove={handleRemoveClass}
              />
            ))}
          </div>
        </div>
        <Combobox
          value={null}
          onChange={handleAddClass}
          virtual={{
            options: autocompleteResults.map(({ c }) => c)
          }}>
          <div className="relative mt-1">
            <ComboboxInput
              className="w-full bg-[#E8F5FE] !border-gray-300 border-[1px] focus:border-[#1DA1F2] focus:outline-none shadow-lg p-1.5 rounded text-xs"
              displayValue={() => query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Add classes"
              autoComplete="off"
              spellCheck="false"
            />
            {autocompleteResults.length > 0 && (
              <ComboboxOptions className="combobox-options absolute bottom-full w-full py-1 mb-1 overflow-auto text-xs bg-white rounded-md shadow-lg max-h-60 ring-1 ring-[#1DA1F2] focus:outline-none">
                {({ option: className }) => {
                  const classData = autocompleteResults.find(
                    (item) => item.c === className
                  )
                  return (
                    <ComboboxOption
                      key={className}
                      value={className}
                      className={({ active }) =>
                        `group w-full cursor-default select-none relative py-1 px-2 flex items-center justify-between text-xs overflow-hidden ${
                          active
                            ? "bg-[#E8F5FE] text-[#1DA1F2]"
                            : "bg-white text-[#657786]"
                        }`
                      }>
                      {({ selected, active }) => (
                        <>
                          <span className="font-mono flex-shrink-0">
                            {className}
                          </span>
                          {classData && (
                            <span className="text-[#657786] flex-shrink-0 ml-2 overflow-hidden">
                              <span className="block truncate group-hover:whitespace-nowrap">
                                <span className="inline-block w-full group-hover:animate-marquee">
                                  {classData.p}
                                </span>
                              </span>
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  )
                }}
              </ComboboxOptions>
            )}
          </div>
        </Combobox>
      </div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}

export default FloatingWindow
