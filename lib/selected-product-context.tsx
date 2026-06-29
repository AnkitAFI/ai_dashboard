"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface SelectedProduct {
  asin: string;
  sellerId: string;
}

interface SelectedProductContextValue {
  selected: SelectedProduct | null;
  setSelected: (p: SelectedProduct | null) => void;
}

const SelectedProductContext = createContext<SelectedProductContextValue>({
  selected: null,
  setSelected: () => {},
});

export function SelectedProductProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedProduct | null>(null);
  return (
    <SelectedProductContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedProductContext.Provider>
  );
}

export function useSelectedProduct() {
  return useContext(SelectedProductContext);
}

