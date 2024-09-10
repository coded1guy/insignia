import React from "react";
import { DropdownProvider } from "./context/CanvasContext";
import Dropdown from "./controls";
import CanvasBanner from "./CanvasBanner";

const DrawCanvas: React.FC = () => {
  return (
    <DropdownProvider>
      <div>
        <h1>Insigni proof of concept</h1>
        <Dropdown />
        <CanvasBanner />
      </div>
    </DropdownProvider>
  );
};
export default DrawCanvas;
