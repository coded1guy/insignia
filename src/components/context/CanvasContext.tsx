import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the type for the context
type DropdownContextType = {
  canvasDimensionOption: number;
  setCanvasDimensionOption?: (value: number) => void;
  updateCanvasDimensionOption: (value: number) => void;
};

// Create the context
const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
);

// Create a provider component
const DropdownProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [canvasDimensionOption, setCanvasDimensionOption] = useState<number>(0);

  function updateCanvasDimensionOption(val: number) {
    if (val < 0 || val > 4) return;
    setCanvasDimensionOption(val);
  }

  return (
    <DropdownContext.Provider
      value={{ canvasDimensionOption, updateCanvasDimensionOption }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

// Custom hook to use the Dropdown context
const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "useDropdownContext must be used within a DropdownProvider"
    );
  }
  return context;
};

export { DropdownProvider, useDropdownContext };
