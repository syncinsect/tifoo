import { act, renderHook } from "@testing-library/react-hooks"

import useTailware from "../../hooks/useTailware"

describe("useTailware", () => {
  const mockSetHighlightedElement = jest.fn()
  const mockSetFloatingWindowPosition = jest.fn()
  const mockSetIsFloatingWindowFixed = jest.fn()

  const defaultProps = {
    isActive: true,
    setHighlightedElement: mockSetHighlightedElement,
    setFloatingWindowPosition: mockSetFloatingWindowPosition,
    setIsFloatingWindowFixed: mockSetIsFloatingWindowFixed
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("handleMouseOver sets highlighted element when active", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    const mockEvent = {
      target: document.createElement("div"),
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as MouseEvent

    act(() => {
      result.current.handleMouseOver(mockEvent)
    })

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(mockEvent.target)
  })

  test("handleMouseOut clears highlighted element when active", () => {
    const { result } = renderHook(() => useTailware(defaultProps))

    act(() => {
      result.current.handleMouseOut()
    })

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(null)
  })

  test("handleClick fixes floating window when not fixed", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 100
    } as unknown as MouseEvent

    act(() => {
      result.current.handleClick(mockEvent)
    })

    expect(mockSetIsFloatingWindowFixed).toHaveBeenCalledWith(true)
    expect(mockSetFloatingWindowPosition).toHaveBeenCalled()
  })

  test("updateFloatingWindowPosition updates position when active and not fixed", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    const mockEvent = {
      clientX: 100,
      clientY: 100
    } as MouseEvent

    // Mock window dimensions
    global.innerWidth = 1024
    global.innerHeight = 768

    act(() => {
      result.current.updateFloatingWindowPosition(mockEvent)
    })

    expect(mockSetFloatingWindowPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number)
      })
    )
  })

  test("updateFloatingWindowPosition does not update position when inactive", () => {
    const inactiveProps = { ...defaultProps, isActive: false }
    const { result } = renderHook(() => useTailware(inactiveProps))
    const mockEvent = {
      clientX: 100,
      clientY: 100
    } as MouseEvent

    act(() => {
      result.current.updateFloatingWindowPosition(mockEvent)
    })

    expect(mockSetFloatingWindowPosition).not.toHaveBeenCalled()
  })

  test("handleScroll updates highlighted element when fixed", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    const mockElement = document.createElement("div")

    // Simulate a fixed floating window with a last highlighted element
    act(() => {
      result.current.handleClick({
        target: mockElement
      } as unknown as MouseEvent)
    })

    act(() => {
      result.current.handleScroll()
    })

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(
      expect.any(HTMLElement)
    )
  })

  test("handleScroll does not update highlighted element when not fixed", () => {
    const { result } = renderHook(() => useTailware(defaultProps))

    act(() => {
      result.current.handleScroll()
    })

    expect(mockSetHighlightedElement).not.toHaveBeenCalled()
  })

  test("isFloatingWindowFixed is initially false", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    expect(result.current.isFloatingWindowFixed).toBe(false)
  })

  test("handleClick toggles isFloatingWindowFixed", () => {
    const { result } = renderHook(() => useTailware(defaultProps))
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 100,
      target: document.createElement("div")
    } as unknown as MouseEvent

    act(() => {
      result.current.handleClick(mockEvent)
    })

    expect(mockSetIsFloatingWindowFixed).toHaveBeenCalledWith(true)

    // Simulate clicking outside the floating window
    const newMockEvent = {
      ...mockEvent,
      target: document.body
    } as unknown as MouseEvent

    act(() => {
      result.current.handleClick(newMockEvent)
    })

    expect(mockSetIsFloatingWindowFixed).toHaveBeenCalledWith(false)
  })
})
