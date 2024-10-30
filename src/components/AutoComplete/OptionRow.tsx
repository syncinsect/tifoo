import type { Option } from "@/types";
import React from "react";

const OptionRow: React.FC<{
  option: Option;
  isHighlighted: boolean;
  onClick: () => void;
}> = React.memo(({ option, isHighlighted, onClick }) => {
  const extractColor = (property: string) => {
    const properties = property.split(";");

    for (const prop of properties) {
      const colorMatch = prop.match(/:([^;]+)/);
      if (!colorMatch) continue;

      const value = colorMatch[1].trim();

      if (
        value.startsWith("#") ||
        value.startsWith("rgb") ||
        value.startsWith("rgba") ||
        value.startsWith("hsl") ||
        value.startsWith("hsla")
      ) {
        return value;
      }
    }

    return null;
  };

  const colorValue = extractColor(option.p);

  return (
    <div
      className={`py-1 px-2 cursor-pointer flex items-center text-xs overflow-hidden ${
        isHighlighted
          ? "bg-[#E8F5FE] text-[#1DA1F2]"
          : "bg-white text-[#657786] hover:bg-[#E8F5FE] hover:text-[#1DA1F2]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center min-w-0 flex-shrink-0">
        {colorValue ? (
          <div
            className="w-4 h-4 min-w-[1rem] mr-2 rounded border border-gray-200 flex-shrink-0"
            style={{ backgroundColor: colorValue }}
          />
        ) : (
          <div className="w-4 h-4 min-w-[1rem] mr-2 flex-shrink-0">{"</>"}</div>
        )}
        <span className="font-mono whitespace-nowrap">{option.c}</span>
      </div>
      {!colorValue && (
        <span className="ml-auto pl-4 text-[#657786] overflow-hidden group">
          <span
            className={`block truncate ${isHighlighted ? "whitespace-nowrap" : "group-hover:whitespace-nowrap"}`}
          >
            <span
              className={`inline-block w-full ${isHighlighted ? "animate-marquee" : "group-hover:animate-marquee"}`}
            >
              {option.p}
            </span>
          </span>
        </span>
      )}
    </div>
  );
});

export default OptionRow;
