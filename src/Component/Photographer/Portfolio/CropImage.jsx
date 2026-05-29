function rotateSize(width, height, rotation) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

const FILE_NAMES = {
  profileImage: "profile.jpg",
  coverMobile: "mobile_cover.jpg",
};

export default function getCroppedImg(imageSrc, pixelCrop, cropType = "cover", rotation = 0, outputSize = null) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    image.onload = () => {
      const rad = (rotation * Math.PI) / 180;

      // Build a bounding-box canvas of the rotated image at natural size
      const { width: bw, height: bh } = rotateSize(image.naturalWidth, image.naturalHeight, rotation);
      const rotCanvas = document.createElement("canvas");
      rotCanvas.width = bw;
      rotCanvas.height = bh;
      const rotCtx = rotCanvas.getContext("2d");
      rotCtx.translate(bw / 2, bh / 2);
      rotCtx.rotate(rad);
      rotCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

      // Determine final output dimensions
      const out = outputSize || { width: 1920, height: 1080 };

      const canvas = document.createElement("canvas");
      canvas.width = out.width;
      canvas.height = out.height;
      const ctx = canvas.getContext("2d");

      // Draw from rotated canvas, scaled to output size
      ctx.drawImage(
        rotCanvas,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        out.width, out.height
      );

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas is empty")); return; }
        const fileName = FILE_NAMES[cropType] || "cover.jpg";
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      }, "image/jpeg");
    };
    image.onerror = (error) => reject(error);
  });
}
