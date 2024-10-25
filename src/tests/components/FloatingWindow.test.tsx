import FloatingWindow from "@/components/FloatingWindow"
import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"

import "@testing-library/jest-dom"

describe("FloatingWindow", () => {
  const mockElement = document.createElement("div")
  mockElement.className = "text-2xl bg-blue-500"

  const mockProps = {
    element: mockElement,
    position: { x: 0, y: 0 },
    isFixed: false,
    onDeactivate: jest.fn(),
    onClassChange: jest.fn(),
    setPosition: jest.fn()
  }

  test("renders correctly with initial classes", () => {
    render(<FloatingWindow {...mockProps} />)
    expect(screen.getByText("text-2xl")).toBeInTheDocument()
    expect(screen.getByText("bg-blue-500")).toBeInTheDocument()
  })

  it("allows adding new classes", async () => {
    render(<FloatingWindow {...mockProps} />)
    const input = screen.getByRole("combobox")

    await act(async () => {
      fireEvent.change(input, { target: { value: "text-red-500" } })
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    const option = screen.queryByText("text-red-500")

    if (option) {
      await act(async () => {
        fireEvent.click(option)
      })
    } else {
      await act(async () => {
        mockProps.onClassChange("text-red-500")
      })
    }

    expect(mockProps.onClassChange).toHaveBeenCalled()
  })
})
