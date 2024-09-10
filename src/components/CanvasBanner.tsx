import { useRef, useState, useEffect, useMemo } from "react";
import canvasStyles from "./style/canvas.module.css";
import { useDropdownContext } from "./context/CanvasContext";

interface CanvasDimension {
  width: number;
  height: number;
  cols: number;
  rows: number;
}
interface InsigniaText {
  text: string;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}
const CanvasBanner = () => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [insignias, setInsignias] = useState<string[] | null>(null);
  const [insigniaTexts, setInsigniaTexts] =
    useState<Array<InsigniaText> | null>(null);
  const [SVGUrl, setSVGUrl] = useState<string>("");
  const [buildSVG, setBuildSVG] = useState<boolean>(false);
  const [canvasDimensions, _] = useState<Array<CanvasDimension>>([
    { width: 1660, height: 1330, cols: 25, rows: 20 },
    { width: 3310, height: 670, cols: 50, rows: 10 },
    { width: 6610, height: 340, cols: 100, rows: 5 },
    { width: 16510, height: 142, cols: 250, rows: 2 },
    { width: 33010, height: 76, cols: 500, rows: 1 },
  ]);

  const { canvasDimensionOption } = useDropdownContext();

  const memoizedCanvasDimensions = useMemo(
    () => canvasDimensions[canvasDimensionOption],
    [canvasDimensions, canvasDimensionOption]
  );

  const batchSize = 20;

  useEffect(() => {
    console.log("fetching svg urls");
    let isMounted = true;
    async function getImages() {
      fetch("images.json").then((res) =>
        res
          .json()
          .then((data) => {
            if (isMounted) {
              setInsignias(data.images);
            }
          })
          .catch((e) => console.error(e))
      );
    }
    getImages();

    const { width, height } = memoizedCanvasDimensions;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("xmlns", svgNS);
    svgRef.current = svg;

    console.log("fetched svg urls");

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!insignias) return;
    setBuildSVG(false);
    console.log("processing image url to svg");
    // REGISTER WORKER
    const workerProcess = new Worker(
      new URL("./workers/process.worker.js", import.meta.url)
    );
    // declare stuffs
    let currentBatch = 0;
    let results: Array<InsigniaText> | null = [];

    const processNextBatch = () => {
      if (!results) return;
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, insignias.length);
      let batch = [];
      let prev: boolean | null = null;

      if (insigniaTexts) {
        batch = insigniaTexts?.slice(start, end);
        prev = true;
      } else {
        batch = insignias.slice(start, end);
      }

      if (batch.length > 0) {
        workerProcess.postMessage({
          prev,
          svgUrls: batch,
          batchIndex: currentBatch,
          batchSize,
          arrangement: memoizedCanvasDimensions,
          maxWidth: 56,
          maxHeight: 56,
          padding: 10,
        });
        currentBatch++;
      } else {
        workerProcess.terminate();
        setInsigniaTexts(results);
        setBuildSVG(true);
        results = null;
        batch.length = 0;
      }
    };

    workerProcess.onmessage = function (e) {
      const {
        batchIndex,
        svgTexts,
      }: {
        batchIndex: number;
        svgTexts: Array<InsigniaText>;
      } = e.data;
      console.log("gotten batch:", batchIndex);
      if (!results) return;
      results.push(...svgTexts);

      // cleanup
      svgTexts.length = 0;
      // next batch
      processNextBatch();
    };

    workerProcess.onerror = function (error) {
      console.error("Worker error:", error);
      workerProcess.terminate();
      setBuildSVG(false);
      results = null;
    };

    processNextBatch();

    return () => {
      workerProcess.terminate();
      setBuildSVG(false);
      results = null;
    };
  }, [insignias, memoizedCanvasDimensions]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!insigniaTexts || !buildSVG || !svg) return;
    console.log("building SVG");

    const parser: DOMParser = new DOMParser();
    let fragment: DocumentFragment | null = document.createDocumentFragment();
    const serializer = new XMLSerializer();

    const chunkSize = 30;
    let currentIndex = 0;

    const processChunk = () => {
      const end = Math.min(currentIndex + chunkSize, insigniaTexts.length);
      if (!parser || !fragment) return;

      for (let i = currentIndex; i < end; i++) {
        console.log(i, insigniaTexts[i].x, insigniaTexts[i].y);
        let svgImage: HTMLElement | null = parser.parseFromString(
          insigniaTexts[i].text,
          "image/svg+xml"
        ).documentElement;
        if (!svgImage) return;
        svgImage.setAttribute("id", `svgImage${i}`);
        svgImage.setAttribute("x", `${insigniaTexts[i].x}`);
        svgImage.setAttribute("y", `${insigniaTexts[i].y}`);
        svgImage.setAttribute("width", `${insigniaTexts[i].width}`);
        svgImage.setAttribute("height", `${insigniaTexts[i].height}`);
        fragment.appendChild(svgImage);
      }

      currentIndex = end;

      if (currentIndex < insigniaTexts.length) {
        requestAnimationFrame(processChunk);
      } else {
        svg.innerHTML = ``;
        svg.appendChild(fragment);
        fragment = null;
        console.log(svg.children);
        console.log("All SVG images appended to bannerSVG");
        console.log("creating bannerSVG download link");
        setSVGUrl(
          URL.createObjectURL(
            new Blob([serializer.serializeToString(svg)], {
              type: "image/svg+xml;charset=utf-8",
            })
          )
        );
        console.log("created bannerSVG download link");
      }
    };

    // Start processing chunks
    requestAnimationFrame(processChunk);

    return () => {
      setBuildSVG(false);
      fragment = null;
      svg.innerHTML = ``;
    };
  }, [buildSVG]);

  // useEffect(() => {
  //   if (!bannerSVG) return;
  //   const container = svgContainerRef.current;
  //   console.log("drawing to container");
  //   if (!container) return;

  //   unstable_batchedUpdates(() => {
  //     container.appendChild(bannerSVG);
  //   });
  //   console.log("drawn");
  // }, [bannerSVG]);

  function downloadCanvas() {
    if (!SVGUrl) return;
    const downloadLink = document.createElement("a");
    downloadLink.href = SVGUrl;
    downloadLink.download = "canvas.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  return (
    <div>
      <div ref={svgContainerRef} className={canvasStyles.container}></div>
      <button onClick={() => downloadCanvas()}>Download canvas</button>
    </div>
  );
};
export default CanvasBanner;
