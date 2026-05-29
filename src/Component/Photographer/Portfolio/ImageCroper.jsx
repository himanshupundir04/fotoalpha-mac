import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./CropImage";
import { Dialog } from "@mui/material";

const COVER_PRESETS = [
  { ratio: 4 / 1, label: "Desktop", sub: "Desktop Cover", type: "coverImage" },
  { ratio: 4 / 5, label: "Mobile", sub: "Mobile Cover", type: "coverMobile" },
];

const PRESET_OUTPUT = {
  Desktop: { width: 2400, height: 600 },
  Mobile: { width: 800, height: 1000 },
};

const CROP_TITLES = {
  profileImage: "Profile Photo",
  coverImage: "Desktop Cover",
  coverMobile: "Mobile Cover",
};

function ImageCropper({ open, onClose, imageSrc, aspect, cropType, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentPreset, setCurrentPreset] = useState(COVER_PRESETS[0]);
  const [originalDims, setOriginalDims] = useState(null);

  const isCoverCrop = cropType === "coverImage";
  const isProfileCrop = cropType === "profileImage";
  const maxZoom = isProfileCrop ? 4 : 3;
  const cropTitle = CROP_TITLES[cropType] || "Image";
  const activeAspect = isCoverCrop ? currentPreset.ratio : aspect;
  const outputSize = isCoverCrop
    ? PRESET_OUTPUT[currentPreset.label]
    : isProfileCrop
      ? { width: 800, height: 800 }
      : { width: 800, height: 1000 };
  const coverDialogTitle = isCoverCrop
    ? (currentPreset.type === "coverMobile" ? "Crop Mobile Cover" : "Crop Desktop Cover")
    : null;

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setShowGrid(true);
    setCroppedAreaPixels(null);
    setCurrentPreset(COVER_PRESETS[0]);
  }, [open, imageSrc]);

  const handleCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const resultType = isCoverCrop ? currentPreset.type : cropType;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, resultType, rotation, outputSize);
      onCropComplete(croppedImage, resultType);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const selectPreset = (preset) => {
    setCurrentPreset(preset);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // ── Simple layout for Profile & Mobile Cover ──────────────────────────────
  if (!isCoverCrop) {
    const dialogSx = isProfileCrop
      ? { width: { xs: "92vw", sm: "520px" }, maxWidth: "520px" }
      : { width: { xs: "92vw", sm: "400px" }, maxWidth: "400px" };

    return (
      <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth PaperProps={{ sx: dialogSx }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
          <span className="text-sm font-medium text-slate-700">Crop {cropTitle}</span>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
        </div>

        <div
          className="relative bg-black"
          style={
            isProfileCrop
              ? { width: "min(100%, 460px)", height: "min(70vh, 460px)", margin: "0 auto" }
              : { width: "100%", height: "80vh", maxHeight: "700px" }
          }
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            objectFit={isProfileCrop ? "cover" : "horizontal-cover"}
            cropShape={isProfileCrop ? "round" : "rect"}
            showGrid={showGrid}
            zoomWithScroll
            minZoom={1}
            maxZoom={maxZoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-2.5">
            <span>Drag to reposition</span>
            <span className="text-slate-200">|</span>
            <span>Scroll or pinch to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 text-base leading-none select-none">−</button>
            <input type="range" min={1} max={maxZoom} step={0.1} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
            <button type="button" onClick={() => setZoom((z) => Math.min(maxZoom, +(z + 0.1).toFixed(1)))}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 text-base leading-none select-none">+</button>
            <span className="min-w-[36px] text-right text-xs text-slate-500 tabular-nums">{zoom.toFixed(1)}×</span>
          </div>
        </div>

        <div className="flex justify-between items-center px-4 py-3 pt-2">
          <button type="button" onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-700 underline">Reset</button>
          <div className="flex gap-2">
            <button onClick={onClose} type="button" className="px-4 py-1.5 rounded border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} type="button" disabled={!croppedAreaPixels} className="px-4 py-1.5 rounded bg-blue text-white text-sm disabled:opacity-50">Apply</button>
          </div>
        </div>
      </Dialog>
    );
  }

  // ── Two-panel layout for Desktop Cover ───────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: "96vw", md: "1100px" },
          maxWidth: "1100px",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-700">{coverDialogTitle}</span>
        <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left controls panel */}
        <div className="w-52 flex-shrink-0 border-r border-slate-200 flex flex-col gap-5 p-4 overflow-y-auto bg-slate-50">

          {/* Aspect Ratio presets */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Aspect Ratio</p>
            <div className="flex flex-col gap-1.5">
              {COVER_PRESETS.map((preset) => {
                const selected = currentPreset.label === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-sm transition ${
                      selected
                        ? "border-blue bg-bgblue text-textblue"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className={`text-xs ${selected ? "opacity-70" : "text-slate-400"}`}>{preset.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Zoom</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm leading-none select-none flex-shrink-0">−</button>
              <input type="range" min={1} max={maxZoom} step={0.1} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 min-w-0" />
              <button type="button" onClick={() => setZoom((z) => Math.min(maxZoom, +(z + 0.1).toFixed(1)))}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm leading-none select-none flex-shrink-0">+</button>
            </div>
            <p className="text-right text-xs text-slate-400 mt-1 tabular-nums">{Math.round(zoom * 100)}%</p>
          </div>

          {/* Rotate */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Rotate</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setRotation((r) => Math.max(-180, r - 1))}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm leading-none select-none flex-shrink-0">−</button>
              <input type="range" min={-180} max={180} step={1} value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))} className="flex-1 min-w-0" />
              <button type="button" onClick={() => setRotation((r) => Math.min(180, r + 1))}
                className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 text-sm leading-none select-none flex-shrink-0">+</button>
            </div>
            <p className="text-right text-xs text-slate-400 mt-1 tabular-nums">{rotation}°</p>
          </div>

          {/* Guides toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guides</p>
            <button
              type="button"
              onClick={() => setShowGrid((g) => !g)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showGrid ? "bg-blue" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${showGrid ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Tip */}
          <div className="rounded-lg bg-bgblue border border-blue/20 p-3 mt-auto">
            <p className="text-xs text-textblue leading-relaxed">
              <span className="font-semibold">Tip:</span> Drag to reposition, scroll to zoom. Use ↺↻ to rotate 90°, or fine-tune with the slider.
            </p>
          </div>
        </div>

        {/* Right: toolbar + canvas + dimensions */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Canvas toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white flex-shrink-0">
            <button type="button" title="Rotate −90°"
              onClick={() => setRotation((r) => Math.max(-180, r - 90))}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-base select-none">↺</button>
            <button type="button" title="Rotate +90°"
              onClick={() => setRotation((r) => Math.min(180, r + 90))}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-base select-none">↻</button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button type="button" onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }); setRotation(0); }}
              className="px-2.5 py-1 rounded text-xs text-slate-600 hover:bg-slate-100 font-medium">Fit</button>
            <span className="px-2 py-1 rounded text-xs text-slate-500 bg-slate-50 tabular-nums border border-slate-200">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Crop canvas */}
          <div className="relative bg-slate-900 flex-1 min-h-0">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={activeAspect}
              objectFit="horizontal-cover"
              cropShape="rect"
              showGrid={showGrid}
              zoomWithScroll
              minZoom={1}
              maxZoom={maxZoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={handleCropComplete}
            />
          </div>

          {/* Dimensions bar */}
          <div className="flex items-center gap-4 px-3 py-2 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <span className="text-xs text-slate-400">
              Original:{" "}
              <span className="text-slate-600 tabular-nums font-medium">
                {originalDims ? `${originalDims.width} × ${originalDims.height}` : "—"}
              </span>
            </span>
            <span className="w-px h-3 bg-slate-300" />
            <span className="text-xs text-slate-400">
              Output:{" "}
              <span className="text-slate-600 tabular-nums font-medium">
                {`${outputSize.width} × ${outputSize.height}`}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 flex-shrink-0 bg-white">
        <button type="button" onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium">
          ↺ Reset
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} type="button"
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSave} type="button" disabled={!croppedAreaPixels}
            className="px-5 py-1.5 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blueHover disabled:opacity-50 disabled:cursor-not-allowed transition">
            Apply Crop
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default ImageCropper;
