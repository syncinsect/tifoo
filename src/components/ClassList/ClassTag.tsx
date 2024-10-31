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
    <div className="tw tw:bg-gray-50/50 tw:px-2 tw:py-1 tw:rounded-lg tw:text-xs tw:flex tw:items-center tw:justify-between tw:shadow-sm tw:transition-all tw:duration-200 tw:border tw:border-gray-100">
      <div className="tw:flex tw:items-center tw:gap-1.5">
        <Switch
          checked={isChecked}
          onChange={handleChange}
          className="group inline-flex h-3.5 w-6 items-center rounded-full !bg-gray-200 transition data-[checked]:!bg-[#1DA1F2]"
        >
          <span className="translate-x-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform duration-200 ease-in-out group-data-[checked]:translate-x-2.5 shadow-sm" />
        </Switch>
        <span className="text-gray-600 font-medium">{className}</span>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(className);
        }}
        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200 w-4 h-4 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  );
};

export default ClassTag;
