import React from "react";
import { useElementNavigation } from "@/hooks";
import { DOMPathBreadcrumb } from "@/components";

interface ElementNavigationProps {
  element: HTMLElement;
  onElementSelect: (element: HTMLElement) => void;
}

const ElementNavigation: React.FC<ElementNavigationProps> = ({
  element,
  onElementSelect,
}) => {
  const { getDOMPath } = useElementNavigation(element);

  const domPath = getDOMPath(3); // Get up to 3 levels

  return (
    <div className="element-navigation mb-3">
      {/* DOM Path Breadcrumb */}
      <DOMPathBreadcrumb
        path={domPath}
        onElementSelect={onElementSelect}
        currentElement={element}
      />
    </div>
  );
};

export default ElementNavigation;
