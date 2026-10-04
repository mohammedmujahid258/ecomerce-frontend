import { useEffect, useState } from "react";

const isBackgroundPixel = (red, green, blue, alpha) => alpha > 0 && red > 235 && green > 235 && blue > 235;

function removeWhiteBackground(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = pixels;
  const queue = [];
  const visited = new Uint8Array(width * height);
  const enqueue = (x, y) => {
    const index = y * width + x;
    if (visited[index]) return;
    visited[index] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x += 1) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 1; y < height - 1; y += 1) { enqueue(0, y); enqueue(width - 1, y); }

  while (queue.length) {
    const [x, y] = queue.pop();
    const pixelIndex = (y * width + x) * 4;
    if (!isBackgroundPixel(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3])) continue;
    data[pixelIndex + 3] = 0;
    if (x > 0) enqueue(x - 1, y);
    if (x < width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < height - 1) enqueue(x, y + 1);
  }

  context.putImageData(pixels, 0, 0);
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) return canvas.toDataURL("image/png");
  const padding = Math.max(8, Math.round(Math.min(width, height) * 0.04));
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = maxX - minX + 1 + padding * 2;
  croppedCanvas.height = maxY - minY + 1 + padding * 2;
  croppedCanvas.getContext("2d").drawImage(canvas, minX, minY, maxX - minX + 1, maxY - minY + 1, padding, padding, maxX - minX + 1, maxY - minY + 1);
  return croppedCanvas.toDataURL("image/png");
}

function ProductImage({ src, alt, className }) {
  const [processedSrc, setProcessedSrc] = useState("");

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const result = removeWhiteBackground(image);
        if (active) setProcessedSrc(result);
      } catch {
        if (active) setProcessedSrc(src);
      }
    };
    image.onerror = () => { if (active) setProcessedSrc(src); };
    image.src = src;
    return () => { active = false; };
  }, [src]);

  return <img src={processedSrc || src} alt={alt} className={className} />;
}

export default ProductImage;
