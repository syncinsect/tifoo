import type { ClassTagProps } from "@/types"
import { Switch } from "@headlessui/react"
import React, { useEffect, useState } from "react"

import {
  applyTailwindStyle,
  refreshTailwind,
  removeTailwindStyle
} from "../utils/tailwindUtils"
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
    <div className="bg-gray-800 text-gray-300 px-2 py-1 rounded-md text-sm flex items-center mr-2 mb-2">
      <Switch
        checked={isChecked}
        onChange={handleChange}
        className={`${
          isChecked ? "bg-blue-500" : "bg-gray-500"
        } relative inline-flex h-4 w-7 items-center rounded-full mr-2`}>
        <span className="sr-only">{className}</span>
        <span
          className={`${
            isChecked ? "translate-x-3" : "translate-x-1"
          } inline-block h-3 w-3 transform rounded-full bg-white transition`}
        />
      </Switch>
      <span>{className}</span>
      <button
        onClick={(e) => {
          e.preventDefault()
          onRemove(className)
        }}
        className="ml-2 text-gray-400 hover:text-gray-200 focus:outline-none">
        ×
      </button>
    </div>
  )
}

export default ClassTag
