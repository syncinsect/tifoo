import React, { useEffect, useRef } from "react";
import type { FloatingWindowProps, ClassItem } from "@/types";
import {
  useFloatingWindowLogic,
  useClassManagement,
  useDraggable,
} from "@/hooks";
import {
  FloatingWindowHeader,
  ClassList,
  AutoComplete,
  Toast,
  ElementNavigation,
} from "@/components";

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onDeactivate,
  onClassChange,
  onElementSelect,
  setPosition,
}) => {
  const floatingWindowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const {
    classes,
    query,
    autocompleteResults,
    handleAddClass,
    handleRemoveClass,
    handleClassToggle,
    handleInputChange,
  } = useClassManagement(element, onClassChange);

  const { toast, setToast, handleCopyClasses, handleCopyElement } =
    useFloatingWindowLogic(classes, element);

  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    useDraggable(isFixed, headerRef, floatingWindowRef, position, setPosition);

  useEffect(() => {
    if (isFixed) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isFixed, handleMouseMove, handleMouseUp]);

  const handleDivMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseDown(e.nativeEvent);
  };

  return (
    <div
      ref={floatingWindowRef}
      className={`floating-window border-none bg-white shadow-lg ${
        isFixed ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: isFixed ? "absolute" : "fixed",
        zIndex: 2147483647,
      }}
      onMouseDown={handleDivMouseDown}
    >
      <FloatingWindowHeader
        ref={headerRef}
        isFixed={isFixed}
        isDragging={isDragging}
        onCopyClasses={handleCopyClasses}
        onCopyElement={handleCopyElement}
        onDeactivate={onDeactivate}
      />
      <div className="px-3 pb-3">
        <div className="bg-[#E8F5FE] text-[#1DA1F2] p-1.5 rounded text-xs mb-2 font-bold">
          {element.tagName.toLowerCase()}
        </div>
        {onElementSelect && (
          <ElementNavigation
            element={element}
            onElementSelect={onElementSelect}
          />
        )}
        <ClassList
          classes={classes}
          element={element}
          onToggle={handleClassToggle}
          onRemove={handleRemoveClass}
        />
        <AutoComplete
          options={autocompleteResults}
          onSelect={handleAddClass}
          onInputChange={handleInputChange}
          inputValue={query}
        />
      </div>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default FloatingWindow;
