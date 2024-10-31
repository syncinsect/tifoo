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
        <div className="tw tw:absolute tw:bottom-full tw:left-0 tw:right-0 tw:z-10 tw:mb-1 tw:bg-white tw:rounded-md tw:shadow-lg tw:border tw:border-[#1DA1F2] tw:overflow-hidden">
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
          className="tw tw:w-full tw:mt-2 tw:bg-white tw:border tw:border-gray-300 tw:focus:ring-1 tw:focus:ring-[#1DA1F2] tw:focus:outline-none tw:shadow-sm tw:p-1.5 tw:pr-6 tw:rounded tw:text-xs tw:placeholder-[#657786] tw:transition tw:duration-150 tw:ease-in-out"
          placeholder="Add classes"
          autoComplete="off"
          spellCheck="false"
        />
        {inputValue && isOpen && (
          <button
            onClick={handleClear}
            className="tw tw:absolute tw:right-1.5 tw:top-1/2 tw:mt-1 tw:transform tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-gray-600 tw:transition-colors tw:duration-150 tw:ease-in-out"
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
