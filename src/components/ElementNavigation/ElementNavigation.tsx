import React from "react";
import { useElementNavigation } from "@/hooks";

interface ElementNavigationProps {
  element: HTMLElement;
  onElementSelect: (element: HTMLElement) => void;
}

const ElementNavigation: React.FC<ElementNavigationProps> = ({
  element,
  onElementSelect,
}) => {
  const {
    getParentElement,
  } = useElementNavigation(element);

  const parentElement = getParentElement();

  const handleElementClick = (targetElement: HTMLElement | null) => {
    if (targetElement) {
      onElementSelect(targetElement);
    }
  };

  const getElementDisplayName = (el: HTMLElement) => {
    const tagName = el.tagName.toLowerCase();
    const className = el.className ? `.${el.className.split(' ')[0]}` : '';
    const id = el.id ? `#${el.id}` : '';
    return `${tagName}${id}${className}`;
  };

  return (
    <div className="element-navigation mb-3">
      <div className="text-xs font-semibold text-gray-600 mb-2">Element Navigation</div>
      {parentElement && (
        <button
          onClick={() => handleElementClick(parentElement)}
          className="w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
          title={`Select parent element: ${getElementDisplayName(parentElement)}`}
        >
          ↑ Select Parent Element
        </button>
      )}
    </div>
  );
};

export default ElementNavigation;
