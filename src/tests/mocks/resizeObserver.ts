const mockResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: mockResizeObserver
})

export { mockResizeObserver as ResizeObserver }
