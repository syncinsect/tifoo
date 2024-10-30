import { forwardRef } from "react";
import type { FloatingWindowHeaderProps } from "@/types";
import { CopyClassesIcon, CopyElementIcon, CloseMarkIcon } from "@/components";
const FloatingWindowHeader = forwardRef<
  HTMLDivElement,
  FloatingWindowHeaderProps
>(
  (
    { isFixed, isDragging, onCopyClasses, onCopyElement, onDeactivate },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`tw tw:flex tw:p-3 tw:justify-between tw:items-center tw:mb-3 tw:pb-2 tw:border-b tw:border-[#1DA1F2] tw:bg-[#1DA1F2] tw:text-white tw:rounded-t-lg ${
          isFixed ? (isDragging ? "tw:cursor-grabbing" : "tw:cursor-grab") : ""
        }`}
      >
        <span className="tw tw:font-righteous tw:text-sm">Tailware</span>
        <div className="tw tw:flex tw:gap-2">
          <button
            onClick={onCopyClasses}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Copy Classes"
          >
            <CopyClassesIcon className="size-4" />
          </button>
          <button
            onClick={onCopyElement}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Copy Element"
          >
            <CopyElementIcon className="size-4" />
          </button>
          <button
            onClick={onDeactivate}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Deactivate"
          >
            <CloseMarkIcon className="size-4" />
          </button>
        </div>
      </div>
    );
  }
);

export default FloatingWindowHeader;
