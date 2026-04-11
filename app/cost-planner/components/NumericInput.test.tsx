import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { NumericInput } from "./NumericInput";

describe("NumericInput", () => {
  const defaultProps = {
    label: "Test Label",
    value: 42,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the label", () => {
    render(<NumericInput {...defaultProps} />);
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders the input with the current value", () => {
    render(<NumericInput {...defaultProps} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(42);
  });

  it("calls onChange with parsed number on input change", () => {
    const onChange = jest.fn();
    render(<NumericInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "99" } });
    expect(onChange).toHaveBeenCalledWith(99);
  });

  it("calls onChange with 0 when input is cleared", () => {
    const onChange = jest.fn();
    render(<NumericInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("displays the suffix when provided", () => {
    render(<NumericInput {...defaultProps} suffix="R$" />);
    expect(screen.getByText("R$")).toBeInTheDocument();
  });

  it("does not display suffix when not provided", () => {
    render(<NumericInput {...defaultProps} />);
    expect(screen.queryByText("R$")).not.toBeInTheDocument();
  });

  it("shows required asterisk when required is true", () => {
    render(<NumericInput {...defaultProps} required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows error message when error prop is provided", () => {
    render(<NumericInput {...defaultProps} error="Campo obrigatório" />);
    expect(screen.getByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("calls onChange with 0 for non-numeric input", () => {
    const onChange = jest.fn();
    render(<NumericInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
