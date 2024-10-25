import type { ClassTagProps } from "@/types"
import { Switch } from "@headlessui/react"
import React, { useEffect, useState } from "react"

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
    <div className="bg-white text-gray-300 px-2 py-1 rounded-md text-sm flex items-center mr-2 mb-2">
      <Switch
        checked={isChecked}
        onChange={handleChange}
        className="group inline-flex h-4 w-7 items-center rounded-full !bg-gray-400 transition data-[checked]:!bg-[#1DA1F2]">
        <span className="translate-x-1 h-3 w-3 rounded-full bg-white transition-transform duration-200 ease-in-out group-data-[checked]:translate-x-3" />
      </Switch>
      <span className="ml-1 text-gray-700">{className}</span>
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
