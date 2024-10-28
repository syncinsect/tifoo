import React, { forwardRef } from "react";
import type { FloatingWindowHeaderProps } from "@/types";

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button
            onClick={onCopyElement}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Copy Element"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>
          <button
            onClick={onDeactivate}
            className="bg-transparent border-none text-white cursor-pointer p-1 rounded hover:bg-[#0C7ABF]"
            title="Deactivate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

export default FloatingWindowHeader;
