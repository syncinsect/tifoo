// Used in Common
export interface ClassItem {
  name: string;
  active: boolean;
}

// Used in: src/utils/domUtils.ts
export interface ComputedStyles {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Used in: src/components/FloatingWindow.tsx
export interface FloatingWindowProps {
  element: HTMLElement;
  position: { x: number; y: number };
  isFixed: boolean;
  onDeactivate: () => void;
  onClassChange: () => void;
  setPosition: (position: { x: number; y: number }) => void;
}

// Used in: src/components/HighlightBox.tsx
export interface HighlightBoxProps {
  element: HTMLElement;
  isFixed: boolean;
  animatedRect: DOMRect | null;
}

// Used in: src/components/ClassTag.tsx
export interface ClassTagProps {
  className: string;
  element: HTMLElement;
  onToggle: (className: string, isChecked: boolean) => void;
  onRemove: (className: string) => void;
}

// Used in: src/components/Toast.tsx
export interface ToastProps {
  message: string;
  onClose: () => void;
}

// Used in: src/hooks/useTailware.ts
export interface UseTailwareProps {
  isActive: boolean;
  setHighlightedElement: (element: HTMLElement | null) => void;
  setFloatingWindowPosition: (position: { x: number; y: number }) => void;
  setIsFloatingWindowFixed: (isFixed: boolean) => void;
}

// Used in: src/components/FloatingWindowHeader.tsx
export interface FloatingWindowHeaderProps {
  isFixed: boolean;
  isDragging: boolean;
  onCopyClasses: () => void;
  onCopyElement: () => void;
  onDeactivate: () => void;
}

// Used in: src/components/ClassList.tsx
export interface ClassListProps {
  classes: ClassItem[];
  element: HTMLElement;
  onToggle: (className: string, isChecked: boolean) => void;
  onRemove: (className: string) => void;
}

// Used in: src/components/AutoComplete.tsx, src/hooks/useClassManagement.ts
export interface Option {
  c: string;
  p: string;
}

// Used in: src/components/BorderLine.tsx
export interface BorderLineProps {
  position: "top" | "bottom" | "left" | "right";
  style: React.CSSProperties;
  lineStyle: string;
}

// Used in: src/components/AutoComplete.tsx
export interface AutoCompleteProps {
  options: Option[];
  onSelect: (value: string) => void;
  onInputChange: (value: string) => void;
  inputValue: string;
}

// Used in: src/utils/tailwindUtils.ts
export type TailwindClassData = {
  c: string; // className
  p: string; // properties
}[];

export interface StyleGroups {
  base: Set<string>;
  sm: Set<string>;
  md: Set<string>;
  lg: Set<string>;
  xl: Set<string>;
  "2xl": Set<string>;
}
