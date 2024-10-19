// src/components/FloatingWindow.tsx
import React, { useEffect, useState } from "react"

import {
  identifyTailwindClasses,
  searchTailwindClasses
} from "../utils/tailwindUtils"
import ClassTag from "./ClassTag"

interface FloatingWindowProps {
  element: HTMLElement
  position: { x: number; y: number }
  isFixed: boolean
  onCopyClasses: () => void
  onCopyElement: () => void
  onDeactivate: () => void
}

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onCopyClasses,
  onCopyElement,
  onDeactivate
}) => {
  const [classes, setClasses] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [autocompleteResults, setAutocompleteResults] = useState<
    [string, string][]
  >([])

  useEffect(() => {
    setClasses(identifyTailwindClasses(element))
  }, [element])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toLowerCase()
    setInputValue(value)
    if (value) {
      setAutocompleteResults(searchTailwindClasses(value))
    } else {
      setAutocompleteResults([])
    }
  }

  const handleAddClass = (newClass: string) => {
    if (!classes.includes(newClass)) {
      element.classList.add(newClass)
      setClasses([...classes, newClass])
    }
    setInputValue("")
    setAutocompleteResults([])
  }

  const handleRemoveClass = (classToRemove: string) => {
    element.classList.remove(classToRemove)
    setClasses(classes.filter((c) => c !== classToRemove))
  }

  return (
    <div
      className={`fixed z-[10001] bg-gray-900 border-2 border-gray-700 rounded-lg p-3 shadow-lg w-88 font-sans text-white ${
        isFixed ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <span className="font-bold text-sm">tailware</span>
        <div className="flex gap-2">
          <button
            onClick={onCopyClasses}
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
            onClick={onCopyElement}
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
      <div className="bg-gray-800 text-gray-300 p-1.5 rounded text-xs font-bold mb-2">
        {element.tagName.toLowerCase()}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {classes.map((cls) => (
          <ClassTag
            key={cls}
            className={cls}
            onRemove={() => handleRemoveClass(cls)}
          />
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add Classes"
          className="w-full bg-gray-800 border-none rounded p-1.5 text-gray-300 text-xs"
        />
        {autocompleteResults.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-b max-h-50 overflow-y-auto z-[10002] list-none p-1 m-0 shadow-lg">
            {autocompleteResults.map(([className, properties]) => (
              <li
                key={className}
                onClick={() => handleAddClass(className)}
                className="p-1.5 cursor-pointer hover:bg-gray-700 text-gray-300 text-xs flex justify-between items-center">
                <span>{className}</span>
                <span
                  className="text-gray-400 text-2xs truncate ml-2"
                  title={properties}>
                  {properties}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FloatingWindow
