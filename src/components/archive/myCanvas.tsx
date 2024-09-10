import React, { useEffect, useState } from "react";
import canvasStyle from "./style/canvas.module.css";

interface ImageData {
  element: HTMLImageElement;
  width: number;
  height: number;
}
interface CanvasDetails {
  width: number;
  height: number;
}
export const CanvasBanner = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  // const [insigniaArr, setInsigniaArr] = React.useState<
  //   HTMLImageElement[] | null
  // >([]);
  const [tempInsignia, setTempInsignia] = useState<ImageData | null>();
  const [canvasDetails, setCanvasDetails] = useState<CanvasDetails | null>();

  function getCanvasDimension() {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    return { width, height };
  }
  function setCanvasDimension() {
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    setCanvasDetails({ width, height });
  }
  function loadImage(src: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const newImage = new Image();
      newImage.src = src;
      newImage.onload = () => {
        resolve({
          element: newImage,
          width: 100,
          height: 100,
        });
        console.log("images: ", newImage.width, newImage.height);
      };
      newImage.onerror = reject;
    });
  }

  useEffect(() => {
    setCanvasDimension();
  }, []);

  useEffect(() => {
    // fetch("YOUR_API_ENDPOINT")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setInsigniaArr(data.images);
    //   });

    (async () => {
      setTempInsignia(await loadImage("/insignia.png"));
    })();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    console.log(canvas.width, canvas.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!tempInsignia) return;
    const { element, width, height } = tempInsignia;
    ctx.drawImage(element, 0, 0, width, height);
  }, [tempInsignia]);

  return (
    <section className={canvasStyle.container}>
      <canvas ref={canvasRef} className={canvasStyle.canvas} />
    </section>
  );
};
