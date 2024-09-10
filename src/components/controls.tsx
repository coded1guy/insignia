import React from "react";
import { useDropdownContext } from "./context/CanvasContext";

const Dropdown: React.FC = () => {
  const { canvasDimensionOption, updateCanvasDimensionOption } =
    useDropdownContext();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateCanvasDimensionOption(Number(event.target.value));
  };

  return (
    <select value={canvasDimensionOption} onChange={handleChange}>
      <option value={0}>25 x 20</option>
      <option value={1}>50 x 10</option>
      <option value={2}>100 x 5</option>
      <option value={3}>250 x 2</option>
      <option value={4}>500 x 1</option>
    </select>
  );
};

export default Dropdown;
