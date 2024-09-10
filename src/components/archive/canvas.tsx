import { useEffect, useRef, useState } from "react";

interface ImageData {
  element: HTMLImageElement;
  width: number;
  height: number;
}

function BannerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const imageUrls: string[] = [
      "/insignia.png",
      "/insignia.png",
      "/insignia.png",
      "/insignia.png",
    ];
    const imagePromises = imageUrls.map((url) => loadImage(url));

    Promise.all(imagePromises).then((loadedImages) => {
      setImages(loadedImages);
    });
    console.log(images);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const positions: [number, number, number, number][] = [];

    const getRandomPosition = (
      imgWidth: number,
      imgHeight: number
    ): { x: number; y: number } => {
      let x: number, y: number, overlap: boolean;
      do {
        overlap = false;
        x = Math.random() * (canvasWidth - imgWidth);
        y = Math.random() * (canvasHeight - imgHeight);
        for (const pos of positions) {
          const [px, py, pWidth, pHeight] = pos;
          if (
            x < px + pWidth &&
            x + imgWidth > px &&
            y < py + pHeight &&
            y + imgHeight > py
          ) {
            overlap = true;
            break;
          }
        }
      } while (overlap);
      positions.push([x, y, imgWidth, imgHeight]);
      return { x, y };
    };

    images.forEach((img) => {
      const { x, y } = getRandomPosition(img.width, img.height);
      ctx.drawImage(img.element, x, y);
    });
  }, [images]);

  const loadImage = (src: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve({
          element: img,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = reject;
    });
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "banner.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      <button onClick={exportCanvas}>Export as Image</button>
      <img src="/insignia.png" />
    </div>
  );
}

export default BannerCanvas;
