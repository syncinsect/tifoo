export interface ComputedStyles {
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface FloatingWindowProps {
  element: HTMLElement
  position: { x: number; y: number }
  isFixed: boolean
  onDeactivate: () => void
  onClassChange: () => void
  setPosition: (position: { x: number; y: number }) => void
}

export interface HighlightBoxProps {
  element: HTMLElement
  isFixed: boolean
  animatedRect: DOMRect | null
}

export interface ClassTagProps {
  className: string
  element: HTMLElement
  onToggle: (className: string, isChecked: boolean) => void
  onRemove: (className: string) => void
}

export interface ToastProps {
  message: string
  onClose: () => void
}

export interface UseTailwareProps {
  isActive: boolean
  setHighlightedElement: (element: HTMLElement | null) => void
  setFloatingWindowPosition: (position: { x: number; y: number }) => void
  setIsFloatingWindowFixed: (isFixed: boolean) => void
}

export type TailwindClassData = {
  c: string // className
  p: string // properties
}[]
