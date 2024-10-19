// src/components/ClassTag.tsx
import React, { useState } from "react"

interface ClassTagProps {
  className: string
  onRemove: () => void
}

const ClassTag: React.FC<ClassTagProps> = ({ className, onRemove }) => {
  const [isChecked, setIsChecked] = useState(true)

  const handleChange = () => {
    setIsChecked(!isChecked)
    if (isChecked) {
      onRemove()
    }
  }

  return (
    <label className="bg-gray-800 text-gray-300 p-1 rounded text-xs flex items-center user-select-none cursor-pointer mb-1">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
        className="appearance-none w-4 h-4 border-2 border-gray-300 rounded mr-2 bg-transparent cursor-pointer checked:bg-blue-500 checked:border-blue-500"
      />
      <span>{className}</span>
    </label>
  )
}

export default ClassTag
