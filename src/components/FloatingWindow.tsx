// src/components/FloatingWindow.tsx
import { Combobox } from "@headlessui/react"
import debounce from "lodash/debounce"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses
} from "../utils/tailwindUtils"
import ClassTag from "./ClassTag"
import Toast from "./Toast"

interface FloatingWindowProps {
  element: HTMLElement
  position: { x: number; y: number }
  isFixed: boolean
  onDeactivate: () => void
  onClassChange: () => void
}

const INITIAL_RESULTS_LIMIT = 100
const LOAD_MORE_INCREMENT = 50

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onDeactivate,
  onClassChange
}) => {
  const [classes, setClasses] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [autocompleteResults, setAutocompleteResults] = useState<
    [string, string][]
  >([])
  const [displayedResults, setDisplayedResults] = useState<[string, string][]>(
    []
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const optionsRef = useRef<HTMLUListElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setClasses(identifyTailwindClasses(element))
  }, [element])

  const debouncedSearch = useMemo(
    () =>
      debounce((searchQuery: string) => {
        if (searchQuery.trim() === "") {
          setAutocompleteResults([])
          setDisplayedResults([])
        } else {
          const matches = searchTailwindClasses(searchQuery)
          setAutocompleteResults(matches)
          setDisplayedResults(matches.slice(0, INITIAL_RESULTS_LIMIT))
        }
      }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
    return () => {
      debouncedSearch.cancel()
    }
  }, [query, debouncedSearch])

  const handleAddClass = (newClass: string) => {
    if (!classes.includes(newClass)) {
      element.classList.add(newClass)
      applyTailwindStyle(element, newClass)
      setClasses([...classes, newClass])
      onClassChange()
      refreshTailwind()
    }
    setQuery("")
    setSelectedClass(null)
  }

  const handleRemoveClass = (classToRemove: string) => {
    element.classList.remove(classToRemove)
    removeTailwindStyle(element, classToRemove)
    setClasses(classes.filter((c) => c !== classToRemove))
    onClassChange()
    refreshTailwind()
  }

  const handleClassToggle = (className: string, isChecked: boolean) => {
    if (isChecked) {
      element.classList.add(className)
      applyTailwindStyle(element, className)
    } else {
      element.classList.remove(className)
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

  const loadMoreResults = useCallback(() => {
    setDisplayedResults((prevResults) => {
      const newResults = [
        ...prevResults,
        ...autocompleteResults.slice(
          prevResults.length,
          prevResults.length + LOAD_MORE_INCREMENT
        )
      ]
      return newResults.length > autocompleteResults.length
        ? autocompleteResults
        : newResults
    })
  }, [autocompleteResults])

  const handleScroll = useCallback(() => {
    if (optionsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = optionsRef.current
      if (scrollHeight - scrollTop <= clientHeight + 1) {
        loadMoreResults()
      }
    }
  }, [loadMoreResults])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (activeIndex >= displayedResults.length - 1) {
        loadMoreResults()
      }
      setActiveIndex((prevIndex) =>
        Math.min(prevIndex + 1, autocompleteResults.length - 1)
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (displayedResults[activeIndex]) {
        handleAddClass(displayedResults[activeIndex][0])
      }
    }
  }

  useEffect(() => {
    if (optionsRef.current) {
      const activeElement = optionsRef.current.children[
        activeIndex
      ] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [activeIndex])

  return (
    <div
      className={`floating-window ${
        isFixed ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: isFixed ? "absolute" : "fixed",
        zIndex: 2147483647
      }}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <span className="font-bold text-sm">tailware</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopyClasses}
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1 rounded hover:bg-gray-800"
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
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1 rounded hover:bg-gray-800"
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
            className="bg-transparent border-none text-gray-300 cursor-pointer p-1 rounded hover:bg-gray-800"
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
      <div className="bg-gray-800 text-gray-300 p-1.5 rounded text-xs mb-2 font-bold">
        {element.tagName.toLowerCase()}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {classes.map((cls) => (
          <ClassTag
            key={cls}
            className={cls}
            element={element}
            onToggle={handleClassToggle}
            onRemove={handleRemoveClass}
          />
        ))}
      </div>
      <Combobox value={selectedClass} onChange={handleAddClass}>
        <div className="relative mt-1">
          {query.trim() !== "" && displayedResults.length > 0 && (
            <Combobox.Options
              ref={optionsRef}
              className="absolute bottom-full w-full py-1 mb-1 overflow-auto text-xs bg-gray-900 rounded-md shadow-lg max-h-60 ring-1 ring-gray-700 focus:outline-none"
              onScroll={handleScroll}
              static>
              {displayedResults.map(([className, properties], index) => (
                <Combobox.Option key={className} value={className}>
                  {({ selected }) => (
                    <li
                      className={`${
                        index === activeIndex
                          ? "bg-gray-700 text-white"
                          : "text-gray-300"
                      } cursor-default select-none relative py-1 px-3 flex justify-between items-center`}>
                      <span className="block truncate">{className}</span>
                      <span
                        className="block truncate text-gray-500 text-right"
                        title={properties}>
                        {properties}
                      </span>
                    </li>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
          <Combobox.Input
            className="w-full bg-gray-800 text-gray-300 p-1.5 rounded text-xs"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add Classes"
          />
        </div>
      </Combobox>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}

export default FloatingWindow
