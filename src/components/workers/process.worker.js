self.onmessage = async (e) => {
  const {
    prev,
    svgUrls,
    batchIndex,
    batchSize,
    arrangement,
    maxWidth,
    maxHeight,
    padding,
  } = e.data;
  const { cols } = arrangement;

  const currentIndex = batchIndex * batchSize;
  const getPosition = (index) => {
    const iter = currentIndex + index;
    const x = padding + (iter % cols) * (maxWidth + padding);
    const y = padding + Math.floor(iter / cols) * (maxHeight + padding);
    return { text: "", x, y, width: maxWidth, height: maxHeight };
  };

  if (prev) {
    svgUrls.forEach((item, index) => {
      const pos = getPosition(index);
      item.x = pos.x;
      item.y = pos.y;
      item.width = pos.width;
      item.height = pos.height;
    });

    self.postMessage({ batchIndex, svgTexts: svgUrls });
  } else {
    const fetchSvg = async (url, index) => {
      try {
        const response = await fetch(url);
        const pos = getPosition(index);
        pos.text = await response.text();
        return pos;
      } catch (error) {
        console.error("Error fetching SVG:", error);
        return null;
      }
    };

    try {
      const svgTexts = await Promise.all(
        svgUrls.map(async (url, index) => {
          return await fetchSvg(url, index);
        })
      );

      self.postMessage({ batchIndex, svgTexts });
      svgTexts = null;
    } catch (error) {
      console.error("Error processing SVGs:", error);
      self.postMessage({ error: "Failed to process SVGs" });
      svgTexts = null;
    }
  }

  // cleanup
  prev = null;
  svgUrls = null;
  batchIndex = null;
  batchSize = null;
  arrangement = null;
  maxWidth = null;
  maxHeight = null;
  padding = null;
  if (arrangement) arrangement.cols = null;
};
