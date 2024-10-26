import React from "react";

interface BorderLineProps {
  position: "top" | "bottom" | "left" | "right";
  style: React.CSSProperties;
  lineStyle: string;
}

const BorderLine: React.FC<BorderLineProps> = ({
  position,
  style,
  lineStyle,
}) => {
  const baseClass = `absolute ${lineStyle} ${position === "top" || position === "bottom" ? "left-0 right-0 border-t-2" : "top-0 bottom-0 border-l-2"}`;
  const transformStyle =
    position === "bottom"
      ? { transform: "translateY(-100%)" }
      : position === "right"
        ? { transform: "translateX(-100%)" }
        : {};

  return (
    <div
      className={`${baseClass} transition-all duration-200 ease-in-out`}
      style={{ ...style, ...transformStyle }}
    />
  );
};

export default BorderLine;
