// src/__tests__/components/ClassTag.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import ClassTag from "../../components/ClassList/ClassTag";

describe("ClassTag", () => {
  const mockOnToggle = jest.fn();
  const mockOnRemove = jest.fn();
  const mockElement = document.createElement("div");
  mockElement.classList.add("test-class");

  const defaultProps = {
    className: "test-class",
    element: mockElement,
    onToggle: mockOnToggle,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with correct class name", () => {
    render(<ClassTag {...defaultProps} />);
    expect(screen.getByText("test-class")).toBeInTheDocument();
  });

  test("toggle switch is checked by default", () => {
    render(<ClassTag {...defaultProps} />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeChecked();
  });

  test("calls onToggle when switch is clicked", () => {
    render(<ClassTag {...defaultProps} />);
    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);
    expect(mockOnToggle).toHaveBeenCalledWith("test-class", false);
  });

  test("calls onRemove when remove button is clicked", () => {
    render(<ClassTag {...defaultProps} />);
    const removeButton = screen.getByText("×");
    fireEvent.click(removeButton);
    expect(mockOnRemove).toHaveBeenCalledWith("test-class");
  });
});
