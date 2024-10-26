import ClassTag from "@/components/ClassTag";
import Toast from "@/components/Toast";
import type { FloatingWindowProps } from "@/types";
import {
  applyTailwindStyle,
  identifyTailwindClasses,
  refreshTailwind,
  removeTailwindStyle,
  searchTailwindClasses,
} from "@/utils/tailwindUtils";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AutoComplete from "./AutoComplete";

const FloatingWindow: React.FC<FloatingWindowProps> = ({
  element,
  position,
  isFixed,
  onDeactivate,
  onClassChange,
  setPosition,
}) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    { c: string; p: string }[]
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeOptionClass, setActiveOptionClass] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const floatingWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setClasses(identifyTailwindClasses(element));
  }, [element]);

  useEffect(() => {
    if (query.trim() === "") {
      setAutocompleteResults([]);
    } else {
      const matches = searchTailwindClasses(query);
      setAutocompleteResults(matches);
    }
  }, [query]);

  const handleAddClass = useCallback(
    (newClass: string | null) => {
      if (!newClass) return;
      const trimmedClass = newClass.trim();
      if (trimmedClass === "") return;

      applyTailwindStyle(element, trimmedClass);
      setClasses((prevClasses) => {
        if (!prevClasses.includes(trimmedClass)) {
          return [...prevClasses, trimmedClass];
        }
        return prevClasses;
      });
      onClassChange();

      setQuery("");
    },
    [element, onClassChange]
  );

  const handleRemoveClass = (classToRemove: string) => {
    element.classList.remove(classToRemove);
    removeTailwindStyle(element, classToRemove);
    setClasses(classes.filter((c) => c !== classToRemove));
    onClassChange();
    refreshTailwind();
  };

  const handleClassToggle = (className: string, isChecked: boolean) => {
    if (isChecked) {
      applyTailwindStyle(element, className);
    } else {
      removeTailwindStyle(element, className);
    }
    onClassChange();
    refreshTailwind();
  };

  const handleCopyClasses = () => {
    const classesString = classes.join(" ");
    navigator.clipboard
      .writeText(classesString)
      .then(() => {
        setToastMessage("Classes copied to clipboard!");
      })
      .catch(() => setToastMessage("Failed to copy classes"));
  };

  const handleCopyElement = () => {
    const elementString = element.outerHTML;
    navigator.clipboard
      .writeText(elementString)
      .then(() => {
        setToastMessage("Element copied to clipboard!");
      })
      .catch(() => setToastMessage("Failed to copy element"));
  };

  const memoizedClasses = useMemo(() => classes, [classes.join(",")]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim() !== "") {
      event.preventDefault();
      if (activeOptionClass) {
        handleAddClass(activeOptionClass);
        setActiveOptionClass(null);
      } else {
        handleAddClass(query.trim());
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFixed && headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && floatingWindowRef.current) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        const windowRect = floatingWindowRef.current.getBoundingClientRect();
        const safetyMargin = 20;
        const maxX = window.innerWidth - windowRect.width - safetyMargin;

        const newX = Math.max(0, Math.min(position.x + deltaX, maxX));
        const newY = position.y + deltaY;

        setPosition({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, dragStart, position, setPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      onMouseDown={handleMouseDown}
    >
      <div
        ref={headerRef}
        className={`flex px-3 pt-3 justify-between items-center mb-3 pb-2 border-b border-[#1DA1F2] bg-[#1DA1F2] text-white p-2 rounded-t-lg ${
          isFixed ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        <span className="font-righteous text-sm">Tailware</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopyClasses}
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
            onClick={handleCopyElement}
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
      <div className="px-3 pb-3">
        <div className="bg-[#E8F5FE] text-[#1DA1F2] p-1.5 rounded text-xs mb-2 font-bold">
          {element.tagName.toLowerCase()}
        </div>
        <div className="h-80 overflow-auto">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {memoizedClasses.map((cls) => (
              <ClassTag
                key={cls}
                className={cls}
                element={element}
                onToggle={handleClassToggle}
                onRemove={handleRemoveClass}
              />
            ))}
          </div>
        </div>
        <AutoComplete
          options={autocompleteResults}
          onSelect={handleAddClass}
          onInputChange={(value) => {
            setQuery(value);
            const matches = searchTailwindClasses(value);
            setAutocompleteResults(matches);
          }}
          inputValue={query}
        />
      </div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default FloatingWindow;
