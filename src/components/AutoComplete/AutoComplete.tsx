import React, { useState, useCallback, useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";

import { AutoCompleteProps } from "@/types";
import { OptionRow, CloseCircleIcon } from "@/components";
import { useHighlightedIndex } from "@/hooks";

const AutoComplete: React.FC<AutoCompleteProps> = ({
  options,
  onSelect,
  onInputChange,
  inputValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { highlightedIndex, updateHighlightedIndex } = useHighlightedIndex(
    options.length
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onInputChange(event.target.value);
      setIsOpen(true);
    },
    [onInputChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          updateHighlightedIndex(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          updateHighlightedIndex(-1);
          break;
        case "Enter":
          event.preventDefault();
          if (isOpen && options.length > 0) {
            onSelect(options[highlightedIndex].c);
            setIsOpen(false);
          } else {
            onSelect(inputValue);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [
      highlightedIndex,
      isOpen,
      options,
      onSelect,
      inputValue,
      updateHighlightedIndex,
    ]
  );

  useEffect(() => {
    if (listRef.current && highlightedIndex !== null) {
      listRef.current.scrollToItem(highlightedIndex, "smart");
    }
  }, [highlightedIndex]);

  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        <OptionRow
          option={options[index]}
          isHighlighted={index === highlightedIndex}
          onClick={() => {
            onSelect(options[index].c);
            setIsOpen(false);
          }}
        />
      </div>
    ),
    [options, highlightedIndex, onSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onInputChange("");
      inputRef.current?.focus();
    },
    [onInputChange]
  );

  return (
    <div className="relative">
      {isOpen && options.length > 0 && (
        <div className=" absolute bottom-full left-0 right-0 z-10 mb-1 bg-white rounded-md shadow-lg border border-[#1DA1F2] overflow-hidden">
          <div className="max-w-full">
            <List
              ref={listRef}
              height={Math.min(options.length * 24, 240)}
              itemCount={options.length}
              itemSize={24}
              width="100%"
              className="scrollbar-thin scrollbar-thumb-[#7ebbe0] scrollbar-track-[#E8F5FE]"
            >
              {Row}
            </List>
          </div>
        </div>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className=" w-full mt-2 bg-white border border-gray-300 focus:ring-1 focus:ring-[#1DA1F2] focus:outline-none shadow-sm p-1.5 pr-6 rounded text-xs placeholder-[#657786] transition duration-150 ease-in-out"
          placeholder="Add classes"
          autoComplete="off"
          spellCheck="false"
        />
        {inputValue && isOpen && (
          <button
            onClick={handleClear}
            className=" absolute right-1.5 top-1/2 mt-1 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 ease-in-out"
            type="button"
          >
            <CloseCircleIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AutoComplete;
