self.onmessage = async (e) => {
  const { svgUrls, batchIndex, batchSize } = e.data;

  const fetchSvg = async (url) => {
    const response = await fetch(url);
    const svgText = await response.text();
    return svgText;
  };

  try {
    const svgTexts = await Promise.all(
      svgUrls.map(async (url, index) => {
        const text = await fetchSvg(url);
        return { text, x: null, y: null, width: null, height: null };
      })
    );

    self.postMessage({ batchIndex, svgTexts });
  } catch (error) {
    console.error("Error fetching SVGs:", error);
    self.postMessage({ error: "Failed to fetch SVGs" });
  }
};
