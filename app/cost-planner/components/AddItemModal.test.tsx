import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AddItemModal } from "./AddItemModal";

describe("AddItemModal", () => {
  const defaultProps = {
    isOpen: true,
    sectionId: "Preparo" as const,
    areaUnitLabel: "Hectare",
    onAdd: jest.fn(),
    onClose: jest.fn(),
    currency: {
      code: "BRL" as const,
      symbol: "R$",
      locale: "pt-BR",
      decimalPlaces: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(<AddItemModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Adicionar Item")).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(<AddItemModal {...defaultProps} />);
    expect(screen.getByText("Adicionar Item")).toBeInTheDocument();
  });

  it("displays the correct section label", () => {
    render(<AddItemModal {...defaultProps} sectionId="Plantio" />);
    expect(screen.getByText("Seção: Plantio")).toBeInTheDocument();
  });

  it("displays Preparação do Solo for Preparo section", () => {
    render(<AddItemModal {...defaultProps} sectionId="Preparo" />);
    expect(screen.getByText("Seção: Preparação do Solo")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<AddItemModal {...defaultProps} />);
    expect(screen.getByText("Nome do Item")).toBeInTheDocument();
    expect(screen.getByText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Unidade")).toBeInTheDocument();
    expect(screen.getByText("Preço Unitário")).toBeInTheDocument();
  });

  it("renders Cancelar and Adicionar buttons", () => {
    render(<AddItemModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Adicionar")).toBeInTheDocument();
  });

  it("calls onClose when Cancelar is clicked", () => {
    const onClose = jest.fn();
    render(<AddItemModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows alert and does not call onAdd when name is empty", () => {
    const onAdd = jest.fn();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    fireEvent.click(screen.getByText("Adicionar"));

    expect(window.alert).toHaveBeenCalledWith("Digite um nome para o item");
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onAdd with correct data when form is filled and submitted", () => {
    const onAdd = jest.fn();
    const onClose = jest.fn();
    render(
      <AddItemModal {...defaultProps} onAdd={onAdd} onClose={onClose} sectionId="Manejo" />
    );

    const nameInput = screen.getByPlaceholderText("Ex: Adubo, Pesticida, Máquina...");
    fireEvent.change(nameInput, { target: { value: "Adubo Orgânico" } });

    fireEvent.click(screen.getByText("Adicionar"));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const addedItem = onAdd.mock.calls[0][0];
    expect(addedItem.name).toBe("Adubo Orgânico");
    expect(addedItem.section).toBe("Manejo");
    expect(addedItem.costCategory).toBe("Insumos");
    expect(addedItem.unit).toBe("kg");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets the name field after successful add", () => {
    const onAdd = jest.fn();
    render(<AddItemModal {...defaultProps} onAdd={onAdd} />);

    const nameInput = screen.getByPlaceholderText("Ex: Adubo, Pesticida, Máquina...");
    fireEvent.change(nameInput, { target: { value: "Test Item" } });
    fireEvent.click(screen.getByText("Adicionar"));

    expect(onAdd).toHaveBeenCalled();
  });
});
