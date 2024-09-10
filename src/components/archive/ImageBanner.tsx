import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
//import { insignias } from "./insignia";

const ImageBanner = () => {
  const [images, setImages] = useState<string[]>([
    "/insignia.png",
    "/insignia.png",
    "/insignia.png",
    "/insignia.png",
  ]);
  const [positions, setPositions] = useState<[{ top?: number; left?: number }]>(
    [{}]
  );
  const bannerRef = useRef(null);

  // useEffect(() => {
  //   const fetchImages = async () => {
  //     const response = await fetch("./insignia.json");
  //     const data = await response.json();
  //     setImages(data.images);
  //   };

  //   fetchImages();
  // }, []);

  useEffect(() => {
    if (images.length > 0) {
      const newPositions: [{ top?: number; left?: number }] = [{}];
      for (let i = 0; i < images.length; i++) {
        let position: { top: number; left: number };
        let overlap;
        do {
          position = {
            top: Math.random() * 90,
            left: Math.random() * 90,
          };
          overlap = newPositions.some(
            (pos) =>
              Math.abs(pos.top! - position.top) < 30 &&
              Math.abs(pos.left! - position.left) < 30
          );
        } while (overlap);
        newPositions.push(position);
      }
      setPositions(newPositions);
    }
  }, [images]);

  const exportAsImage = () => {
    if (bannerRef.current) {
      html2canvas(bannerRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "banner.png";
        link.click();
      });
    }
  };

  return (
    <div>
      <div
        className="banner"
        ref={bannerRef}
        style={{ position: "relative", width: "100%", height: "500px" }}
      >
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`img-${index}`}
            className="banner-img"
            style={{
              position: "absolute",
              top: `${positions[index]?.top}%`,
              left: `${positions[index]?.left}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
      <button onClick={exportAsImage}>Export as Image</button>
    </div>
  );
};

export default ImageBanner;
