import { Option } from "../types";
import React from "react";

const OptionRow: React.FC<{
  option: Option;
  isHighlighted: boolean;
  onClick: () => void;
}> = React.memo(({ option, isHighlighted, onClick }) => (
  <div
    className={`py-1 px-2 cursor-pointer flex items-center justify-between text-xs ${
      isHighlighted
        ? "bg-[#E8F5FE] text-[#1DA1F2]"
        : "bg-white text-[#657786] hover:bg-[#E8F5FE] hover:text-[#1DA1F2]"
    }`}
    onClick={onClick}
  >
    <span className="font-mono flex-shrink-0 truncate max-w-[45%]">
      {option.c}
    </span>
    <span className="ml-2 text-[#657786] flex-shrink-0 overflow-hidden group max-w-[55%]">
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
  </div>
));

export default OptionRow;
