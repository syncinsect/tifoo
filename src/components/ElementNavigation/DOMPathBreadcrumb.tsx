import React from "react";
import { DOMPathItem } from "@/hooks/useElementNavigation";

interface DOMPathBreadcrumbProps {
  path: DOMPathItem[];
  onElementSelect: (element: HTMLElement) => void;
  currentElement: HTMLElement;
}

const DOMPathBreadcrumb: React.FC<DOMPathBreadcrumbProps> = ({
  path,
  onElementSelect,
  currentElement,
}) => {
  const getElementDisplayName = (item: DOMPathItem) => {
    return item.tagName;
  };

  const isCurrentElement = (item: DOMPathItem) => {
    return item.element === currentElement; 
  };

  return (
    <div className="dom-path-breadcrumb bg-[#E8F5FE] text-[#1DA1F2] p-1.5 rounded text-xs mb-2 font-bold">
      <div className="flex flex-wrap gap-1 items-center text-xs">
        {path.map((item, index) => (
          <React.Fragment key={`${item.tagName}-${index}`}>
            {index > 0 && (
              <span className="text-gray-400 mx-1">{'>'}</span>
            )}
            <span
              onClick={() => onElementSelect(item.element)}
              className={`cursor-pointer transition-all ${
                isCurrentElement(item)
                  ? "text-blue-600 underline"
                  : "text-gray-600 hover:text-gray-800 hover:underline"
              }`}
              title={`Select ${getElementDisplayName(item)}`}
            >
              {getElementDisplayName(item)}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DOMPathBreadcrumb;
