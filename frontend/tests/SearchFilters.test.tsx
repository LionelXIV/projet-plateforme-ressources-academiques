import React, { createContext, useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SearchFilters from "../src/components/SearchFilters";

type SelectContextValue = {
  onValueChange: (value: string) => void;
  value: string;
};

const SelectContext = createContext<SelectContextValue | null>(null);

vi.mock("../src/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </SelectContext.Provider>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => {
    const ctx = useContext(SelectContext);
    return <span>{ctx?.value || placeholder || ""}</span>;
  },
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => {
    const ctx = useContext(SelectContext);
    return (
      <button type="button" onClick={() => ctx?.onValueChange(value)}>
        {children}
      </button>
    );
  },
}));

describe("SearchFilters", () => {
  test("transmet les interactions de filtrage au parent", () => {
    const onSearchChange = vi.fn();
    const onCategoryChange = vi.fn();
    const onLevelChange = vi.fn();
    const onResetFilters = vi.fn();

    render(
      <SearchFilters
        searchQuery="React"
        categoryFilter="Développement"
        levelFilter="Débutant"
        categories={["Développement", "Design"]}
        levels={["Débutant", "Avancé"]}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onLevelChange={onLevelChange}
        onResetFilters={onResetFilters}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      "Rechercher un cours, un instructeur...",
    );
    fireEvent.change(searchInput, { target: { value: "React avancé" } });
    expect(onSearchChange).toHaveBeenCalledWith("React avancé");

    fireEvent.click(screen.getByText("Design"));
    expect(onCategoryChange).toHaveBeenCalledWith("Design");

    fireEvent.click(screen.getByText("Avancé"));
    expect(onLevelChange).toHaveBeenCalledWith("Avancé");

    const resetButton = screen.getByRole("button", {
      name: /Réinitialiser les filtres/i,
    });
    expect(resetButton.getAttribute("disabled")).toBeNull();
    fireEvent.click(resetButton);
    expect(onResetFilters).toHaveBeenCalled();
  });
});
