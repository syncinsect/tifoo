// src/components/ClassTag.tsx
import React, { useEffect, useState } from "react"

import {
  applyTailwindStyle,
  refreshTailwind,
  removeTailwindStyle
} from "../utils/tailwindUtils"

interface ClassTagProps {
  className: string
  element: HTMLElement
  onToggle: (className: string, isChecked: boolean) => void
  onRemove: (className: string) => void
}

const ClassTag: React.FC<ClassTagProps> = ({
  className,
  element,
  onToggle,
  onRemove
}) => {
  const [isChecked, setIsChecked] = useState(true)

  useEffect(() => {
    setIsChecked(element.classList.contains(className))
  }, [className, element])

  const handleChange = () => {
    const newCheckedState = !isChecked
    setIsChecked(newCheckedState)
    onToggle(className, newCheckedState)
  }

  return (
    <label className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-sm flex items-center mr-2 mb-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="appearance-none w-4 h-4 border-2 border-gray-500 rounded mr-2 bg-transparent cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-colors duration-200 ease-in-out"
      />
      <span>{className}</span>
      <button
        onClick={(e) => {
          e.preventDefault()
          onRemove(className)
        }}
        className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none">
        ×
      </button>
    </label>
  )
}

export default ClassTag
