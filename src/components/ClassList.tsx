import React from "react";
import ClassTag from "./ClassTag";

interface ClassListProps {
  classes: string[];
  element: HTMLElement;
  onToggle: (className: string, isChecked: boolean) => void;
  onRemove: (className: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({
  classes,
  element,
  onToggle,
  onRemove,
}) => {
  return (
    <div className="h-80 overflow-auto">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {classes.map((cls) => (
          <ClassTag
            key={cls}
            className={cls}
            element={element}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default ClassList;
