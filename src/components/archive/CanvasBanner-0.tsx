import { useRef, useState, useEffect } from "react";
import canvasStyles from "./style/canvas.module.css";
import { useDropdownContext } from "./context/CanvasContext";

interface CanvasDimension {
  width: number;
  height: number;
  cols: number;
  rows: number;
}
const CanvasBanner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [insignias, setInsignias] = useState<HTMLImageElement[] | null>(null);
  const [canvasDimensions, _] = useState<CanvasDimension[]>([
    { width: 1660, height: 1330, cols: 25, rows: 20 },
    { width: 3310, height: 670, cols: 50, rows: 10 },
    { width: 6610, height: 340, cols: 100, rows: 5 },
    { width: 16510, height: 142, cols: 250, rows: 2 },
    { width: 33010, height: 76, cols: 500, rows: 1 },
  ]);
  const { canvasDimensionOption } = useDropdownContext();

  useEffect(() => {
    function loadImage(src: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new Image(56, 56);
        img.src = src;
        img.onload = () => {
          resolve(img);
        };
        img.onerror = reject;
      });
    }
    async function getImages() {
      fetch("images.json").then((res) =>
        res
          .json()
          .then((data) => {
            const imagesArr: string[] = data.images;
            const imagePromises = imagesArr.map((image) => loadImage(image));

            Promise.all(imagePromises).then((loadedImages) => {
              console.log(loadedImages);
              setInsignias(loadedImages);
            });
          })
          .catch((e) => console.error(e))
      );
    }
    getImages();
  }, []);

  useEffect(() => {
    // define canvas
    const canvas = canvasRef.current;
    // define SVG (banner that will be exported)
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = svgRef.current;

    if (!canvas) return;
    if (!svg) return;
    console.log(canvas, canvasDimensionOption);
    // set canvas dimension
    const { width, height } = canvasDimensions[canvasDimensionOption];
    canvas.width = width;
    canvas.height = height;
    // set SVG dimension
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("xmlns", svgNS);
    console.log(canvas.width, canvas.height);

    // draw one item on the canvas
    if (!insignias) return;
    const ctx = canvas.getContext("2d");

    // current image dimension
    let largestImageDimension = { width: 56, height: 56 };

    // draw insignia on canvas
    function drawInsignia(insignia: HTMLImageElement, x: number, y: number) {
      if (!ctx) return;
      ctx.drawImage(insignia, x, y, insignia.width, insignia.height);
    }
    // draw insignia on SVG
    function drawInsigniaOnSVG(
      insignia: HTMLImageElement,
      x: number,
      y: number
    ) {
      if (!svg) return;
      const svgImage = document.createElementNS(svgNS, "image");
      svgImage.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        insignia.src
      );
      svgImage.setAttribute("x", `${x}`);
      svgImage.setAttribute("y", `${y}`);
      svgImage.setAttribute("width", `${insignia.width}`);
      svgImage.setAttribute("height", `${insignia.height}`);

      console.log(svgImage);
      // Append to the main SVG element
      svg.appendChild(svgImage);
    }

    /* CORE LOGIC P - drawing the canvas and building the SVG */
    // the arrangement order
    const arrangement = canvasDimensions[canvasDimensionOption];
    // current draw positions (x and y)
    let currentX = 10;
    let currentY = 10;
    // the column iterator
    let colIter = 0;
    // the row iterator
    let rowIter = 0;
    // the insignias iterator
    let insigniaIter = 0;
    // the padding
    let padding = 10;

    function drawEachInsignia() {
      if (!insignias) return;
      while (rowIter < arrangement.rows) {
        let colIter = 0;
        currentX = 10;
        while (colIter < arrangement.cols) {
          drawInsignia(insignias[insigniaIter], currentX, currentY);
          drawInsigniaOnSVG(insignias[insigniaIter], currentX, currentY);
          currentX += largestImageDimension.width;
          if (arrangement.cols - colIter > 1) {
            currentX += padding;
          }
          requestAnimationFrame(drawEachInsignia);
          insigniaIter++;
          colIter++;
        }
        currentY += largestImageDimension.height;
        if (arrangement.rows - rowIter > 1) {
          currentY += padding;
        }
        rowIter++;
      }
    }
    requestAnimationFrame(drawEachInsignia);

    // // download svg
    // const serializer = new XMLSerializer();
    // const svgString = serializer.serializeToString(svg);

    // // Create a Blob from the SVG string
    // const svgBlob = new Blob([svgString], {
    //   type: "image/svg+xml;charset=utf-8",
    // });
    // const svgUrl = URL.createObjectURL(svgBlob);

    // // Create a link and trigger download
    // const downloadLink = document.createElement("a");
    // downloadLink.href = svgUrl;
    // downloadLink.download = "canvas.svg";
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
  }, [insignias, canvasDimensionOption]);

  function downloadCanvas() {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL("image/svg");

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas-image.svg";

    // Trigger the download
    link.click();
  }

  return (
    <div className={canvasStyles.container}>
      <canvas ref={canvasRef}></canvas>
      <svg ref={svgRef} version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>
      <button onClick={() => downloadCanvas()}>Download canvas</button>
    </div>
  );
};
export default CanvasBanner;
