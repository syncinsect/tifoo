import type { ClassTagProps } from "@/types";
import { Switch } from "@headlessui/react";
import React, { useEffect, useState } from "react";

const ClassTag: React.FC<ClassTagProps> = ({
  className,
  element,
  onToggle,
  onRemove,
}) => {
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    setIsChecked(element.classList.contains(className));
  }, [className, element]);

  const handleChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onToggle(className, newCheckedState);
  };

  return (
    <div className="tw tw:bg-gray-50 tw:text-gray-300 tw:px-2.5 tw:py-1.5 tw:rounded-lg tw:text-sm tw:flex tw:items-center tw:mr-2 tw:mb-2 tw:shadow-sm tw:hover:shadow tw:transition-all tw:duration-200 tw:border tw:border-gray-100">
      <Switch
        checked={isChecked}
        onChange={handleChange}
        className="group inline-flex h-4 w-7 items-center rounded-full !bg-gray-200 transition data-[checked]:!bg-[#1DA1F2]"
      >
        <span className="translate-x-1 h-3 w-3 rounded-full bg-white transition-transform duration-200 ease-in-out group-data-[checked]:translate-x-3 shadow-sm" />
      </Switch>
      <span className="ml-2 text-gray-600 font-medium">{className}</span>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(className);
        }}
        className="ml-2 text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200"
      >
        ×
      </button>
    </div>
  );
};

export default ClassTag;
