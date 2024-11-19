import { useTifoo } from "@/hooks";
import { act, renderHook } from "@testing-library/react";

describe("useTifoo", () => {
  const mockSetHighlightedElement = jest.fn();
  const mockSetFloatingWindowPosition = jest.fn();
  const mockSetIsFloatingWindowFixed = jest.fn();

  const defaultProps = {
    isActive: true,
    setHighlightedElement: mockSetHighlightedElement,
    setFloatingWindowPosition: mockSetFloatingWindowPosition,
    setIsFloatingWindowFixed: mockSetIsFloatingWindowFixed,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handleMouseOver sets highlighted element when active", () => {
    const { result } = renderHook(() => useTifoo(defaultProps));
    const mockElement = document.createElement("div");
    const mockEvent = { target: mockElement } as unknown as MouseEvent;

    act(() => {
      result.current.handleMouseOver(mockEvent);
    });

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(mockElement);
  });

  test("handleMouseOut clears highlighted element when active", () => {
    const { result } = renderHook(() => useTifoo(defaultProps));

    act(() => {
      result.current.handleMouseOut();
    });

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(null);
  });

  test("handleClick toggles isFloatingWindowFixed", () => {
    const { result } = renderHook(() => useTifoo(defaultProps));
    const mockElement = document.createElement("div");
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      clientX: 100,
      clientY: 100,
      target: mockElement,
    } as unknown as MouseEvent;

    expect(result.current.isFloatingWindowFixed).toBe(false);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(mockSetIsFloatingWindowFixed).toHaveBeenCalledWith(true);

    const outsideElement = document.createElement("div");
    const outsideEvent = { ...mockEvent, target: outsideElement };

    act(() => {
      result.current.handleClick(outsideEvent);
    });

    expect(mockSetIsFloatingWindowFixed).toHaveBeenCalledWith(false);
  });

  test("updateFloatingWindowPosition updates position when not fixed", () => {
    const { result } = renderHook(() => useTifoo(defaultProps));
    const mockEvent = {
      clientX: 100,
      clientY: 100,
    } as unknown as MouseEvent;

    act(() => {
      result.current.updateFloatingWindowPosition(mockEvent);
    });

    expect(mockSetFloatingWindowPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      })
    );
  });

  test("handleScroll updates highlighted element when fixed", () => {
    const { result } = renderHook(() => useTifoo(defaultProps));
    const mockElement = document.createElement("div");

    act(() => {
      result.current.handleMouseOver({
        target: mockElement,
      } as unknown as MouseEvent);
      result.current.handleClick({
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 100,
        target: mockElement,
      } as unknown as MouseEvent);
    });

    mockSetHighlightedElement.mockClear();

    act(() => {
      result.current.handleScroll();
    });

    expect(mockSetHighlightedElement).toHaveBeenCalledWith(mockElement);
  });
});
