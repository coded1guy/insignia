self.onmessage = function (e) {
  const {
    insigniaTexts,
    arrangement,
    maxWidth,
    maxHeight,
    padding,
    batchStart,
    batchSize,
  } = e.data;
  const { cols } = arrangement;

  const updatedBatch = insigniaTexts
    .slice(batchStart, batchStart + batchSize)
    .map((insignia, i) => {
      const absoluteIndex = batchStart + i;
      const currentX = padding + (absoluteIndex % cols) * (maxWidth + padding);
      const currentY =
        padding + Math.floor(absoluteIndex / cols) * (maxHeight + padding);

      return {
        ...insignia,
        x: currentX,
        y: currentY,
        width: maxWidth,
        height: maxHeight,
      };
    });

  self.postMessage({ batchStart, updatedBatch });
};
