import { useRef, useState, useEffect } from "react";
import canvasStyles from "./style/canvas.module.css";
import { useDropdownContext } from "./context/CanvasContext";

interface CanvasDimension {
  width: number;
  height: number;
  cols: number;
  rows: number;
}
interface ImagePosition {
  index: number;
  x: number;
  y: number;
}
const CanvasBanner = () => {
  const svgRef = useRef(null);
  // const [insignias, setInsignias] = useState<Array<HTMLImageElement> | null>(
  //   null
  // );
  const [insignias, setInsignias] = useState<string[] | null>(null);
  const [canvasDimensions, _] = useState<Array<CanvasDimension>>([
    { width: 1660, height: 1330, cols: 25, rows: 20 },
    { width: 3310, height: 670, cols: 50, rows: 10 },
    { width: 6610, height: 340, cols: 100, rows: 5 },
    { width: 16510, height: 142, cols: 250, rows: 2 },
    { width: 33010, height: 76, cols: 500, rows: 1 },
  ]);
  const [imgPos, setImgPos] = useState<Array<ImagePosition>>([]);
  const { canvasDimensionOption } = useDropdownContext();

  useEffect(() => {
    // function loadImage(src: string): Promise<HTMLImageElement> {
    //   return new Promise((resolve, reject) => {
    //     const img = new Image(56, 56);
    //     img.src = src;
    //     img.onload = () => {
    //       resolve(img);
    //     };
    //     img.onerror = reject;
    //   });
    // }
    async function getImages() {
      fetch("images.json").then((res) =>
        res
          .json()
          .then((data) => {
            setInsignias(data.images);
            // const imagesArr: string[] = data.images;
            // const imagePromises = imagesArr.map((image) => loadImage(image));

            // Promise.all(imagePromises).then((loadedImages) => {
            //   console.log(loadedImages);
            //   setInsignias(loadedImages);
            // });
          })
          .catch((e) => console.error(e))
      );
    }
    getImages();
  }, []);

  useEffect(() => {
    if (!insignias) return;
    const worker = new Worker(
      new URL("./workers/pos.worker.js", import.meta.url)
    );

    const { cols, rows } = canvasDimensions[canvasDimensionOption];

    worker.postMessage({
      length: insignias.length,
      arrangement: { cols, rows },
      maxWidth: 56,
      maxHeight: 56,
      padding: 10,
    });

    worker.onmessage = function (e) {
      setImgPos(e.data);
    };

    return () => {
      worker.terminate();
    };
  }, [insignias]);

  useEffect(() => {
    if (!insignias) return;
    const worker = new Worker(
      new URL("./workers/svgText.worker.js", import.meta.url)
    );

    const { cols, rows } = canvasDimensions[canvasDimensionOption];

    worker.postMessage({
      length: insignias.length,
      arrangement: { cols, rows },
      maxWidth: 56,
      maxHeight: 56,
      padding: 10,
    });

    worker.onmessage = function (e) {
      setImgPos(e.data);
    };

    return () => {
      worker.terminate();
    };
  }, [insignias]);

  useEffect(() => {
    // define SVG (banner that will be exported)
    //const svgNS = "http://www.w3.org/2000/svg";
    const svg = svgRef.current;
    if (!svg) return;
    // set dimension
    const { width, height } = canvasDimensions[canvasDimensionOption];
    // set SVG dimension
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    //svg.setAttribute("xmlns", svgNS);

    // draw one item on the canvas
    if (!insignias) return;

    // current image dimension
    let largestImageDimension = { width: 56, height: 56 };

    // const observer = new IntersectionObserver(
    //   (entries, observer) => {
    //     entries.forEach((entry) => {
    //       console.log(entry);
    //       if (entry.isIntersecting) {
    //         const target = entry.target as SVGElement;
    //         console.log(target);
    //         const { url, x, y } = target.dataset;
    //         const width = target.getAttribute("width");
    //         const height = target.getAttribute("height");

    //         if (!url || !x || !y || !width || !height) return;
    //         // Fetch and embed SVG when it comes into view
    //         fetch(url)
    //           .then((response) => response.text())
    //           .then((svgText) => {
    //             const parser = new DOMParser();
    //             const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    //             const svgElement = svgDoc.documentElement;

    //             // Set position and size using the x and y values passed
    //             svgElement.setAttribute("x", x);
    //             svgElement.setAttribute("y", y);
    //             svgElement.setAttribute("width", width);
    //             svgElement.setAttribute("height", height);

    //             // Replace placeholder with actual SVG
    //             entry.target.replaceWith(svgElement);
    //             observer.unobserve(entry.target); // Stop observing once loaded
    //           })
    //           .catch((error) => {
    //             console.error("Failed to load SVG:", error);
    //           });
    //       }
    //     });
    //   },
    //   { root: null, rootMargin: "0px", threshold: 0.1 }
    // );

    // draw insignia on SVG
    async function drawInsigniaOnSVG(
      insignia: HTMLImageElement,
      x: number,
      y: number
    ) {
      if (!svg) return;
      // const svgImage = document.createElementNS(svgNS, "image");
      // svgImage.setAttributeNS(
      //   "http://www.w3.org/1999/xlink",
      //   "xlink:href",
      //   insignia.src
      // );
      // svgImage.setAttribute("x", `${x}`);
      // svgImage.setAttribute("y", `${y}`);
      // svgImage.setAttribute("width", `${insignia.width}`);
      // svgImage.setAttribute("height", `${insignia.height}`);

      // console.log(svgImage);
      // // Append to the main SVG element
      // svg.appendChild(svgImage);

      // const placeholder = document.createElementNS(
      //   "http://www.w3.org/2000/svg",
      //   "rect"
      // );
      // placeholder.setAttribute("x", `${x}`);
      // placeholder.setAttribute("y", `${y}`);
      // placeholder.setAttribute("width", `${insignia.width}`);
      // placeholder.setAttribute("height", `${insignia.height}`);
      // placeholder.setAttribute("fill", "#eee");
      // placeholder.setAttribute("data-url", insignia.src);
      // placeholder.setAttribute("data-x", `${x}`);
      // placeholder.setAttribute("data-y", `${y}`);
      // svg.appendChild(placeholder);
      // observer.observe(placeholder);

      fetch(insignia.src)
        .then((response) => response.text())
        .then((svgText) => {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
          const svgElement = svgDoc.documentElement;

          // Set position and size using the x and y values passed
          svgElement.setAttribute("x", `${x}`);
          svgElement.setAttribute("y", `${y}`);
          svgElement.setAttribute("width", `${insignia.width}`);
          svgElement.setAttribute("height", `${insignia.height}`);

          svg.appendChild(svgElement);
        })
        .catch((error) => {
          console.error("Failed to load SVG:", error);
        });
    }

    /* CORE LOGIC P - drawing the canvas and building the SVG */
    // the arrangement order
    const arrangement = canvasDimensions[canvasDimensionOption];
    // current draw positions (x and y)
    let currentX = 10;
    let currentY = 10;
    // the column iterator
    //let colIter = 0;
    // the row iterator
    //let rowIter = 0;
    // the padding
    let padding = 10;

    function next(currentIter: number) {
      currentX += largestImageDimension.width + padding;
      if (!((currentIter + 1) % arrangement.cols)) {
        currentY += largestImageDimension.height + padding;
        currentX = 10;
      }
    }

    function drawEachInsignia() {
      if (!insignias) return;
      let iter = 0;
      while (iter < insignias.length) {
        drawInsigniaOnSVG(insignias[iter], currentX, currentY);
        next(iter);
        setTimeout(() => iter++, 10000);
      }

      // while (rowIter < arrangement.rows) {
      //   let colIter = 0;
      //   currentX = 10;
      //   while (colIter < arrangement.cols) {
      //     drawInsigniaOnSVG(insignias[insigniaIter], currentX, currentY);
      //     currentX += largestImageDimension.width;
      //     if (arrangement.cols - colIter > 1) {
      //       currentX += padding;
      //     }
      //     //requestAnimationFrame(drawEachInsignia);

      //     insigniaIter++;
      //     colIter++;
      //   }
      //   currentY += largestImageDimension.height;
      //   if (arrangement.rows - rowIter > 1) {
      //     currentY += padding;
      //   }
      //   rowIter++;
      // }
    }

    // const batches = insignias.length / batch;
    // for (let ai = 0; ai < batches; ai++) {
    //   setTimeout(() => drawEachInsignia(batch), 50000);
    // }

    // return () => observer.disconnect();
    //requestAnimationFrame(drawEachInsignia);
    drawEachInsignia();
  }, [insignias, canvasDimensionOption]);

  function downloadCanvas() {
    if (!svgRef.current) return;
    // download svg
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgRef.current);

    // Create a Blob from the SVG string
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create a link and trigger download
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "canvas.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  return (
    <div>
      <div ref={svgRef} className={canvasStyles.container}></div>
      <button onClick={() => downloadCanvas()}>Download canvas</button>
    </div>
  );
};
export default CanvasBanner;
