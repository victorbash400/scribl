import React, { useEffect, useRef, useState } from 'react';
import ProcessingAnimation from './ProcessingAnimation';

const CanvasArea = ({
  canvasRef,
  selectedTool,
  brushColor,
  brushSize,
  brushOpacity,
  isProcessing,
  onDoneDrawing,
  onResetDrawing,
  setShowPreview,
  generatedImage,
  onCanvasChange,
}) => {
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const lastPointRef = useRef(null);
  const animationFrameRef = useRef(null);
  const pointsQueue = useRef([]);
  const hasDrawnRef = useRef(false);

  // Apply brush settings to canvas context
  const applyBrushSettings = (context) => {
    if (!context) return;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = brushSize;
    context.globalAlpha = brushOpacity;
    context.globalCompositeOperation =
      selectedTool === 'eraser' ? 'destination-out' : 'source-over';
    if (selectedTool !== 'eraser') {
      context.strokeStyle = brushColor;
    }
  };

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    contextRef.current = context;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');
      if (canvas.width > 0 && canvas.height > 0) {
        tempContext.drawImage(canvas, 0, 0);
      }

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.scale(dpr, dpr);
      if (!hasDrawnRef.current) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, rect.width, rect.height);
      } else if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        context.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
      }

      applyBrushSettings(context);
      setIsCanvasReady(true);
      onCanvasChange();
    };

    resizeCanvas();
    let resizeTimeout;
    const handleWindowResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(resizeTimeout);
    };
  }, []); // Empty dependency array: runs only on mount

  // Update brush settings
  useEffect(() => {
    if (!contextRef.current || !isCanvasReady) return;
    applyBrushSettings(contextRef.current);
  }, [brushColor, brushSize, brushOpacity, selectedTool, isCanvasReady]);

  // Draw generated image
  useEffect(() => {
    if (!generatedImage || !canvasRef.current || !isCanvasReady) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || canvas.width <= 0 || canvas.height <= 0) return;

    const image = new Image();
    image.onload = () => {
      try {
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        ctx.restore();

        applyBrushSettings(ctx);
        hasDrawnRef.current = true;
        onCanvasChange();
      } catch (error) {
        console.error('Failed to draw image:', error);
      }
    };
    image.src = generatedImage;
  }, [generatedImage, isCanvasReady]); // Only depends on generatedImage and isCanvasReady

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const isTouch = event.touches && event.touches.length > 0;
    return {
      x: (isTouch ? event.touches[0].clientX : event.clientX) - rect.left,
      y: (isTouch ? event.touches[0].clientY : event.clientY) - rect.top,
      pressure: isTouch ? event.touches[0].force || 0.5 : event.pressure || 0.5,
    };
  };

  const drawPoint = (point, lastPoint) => {
    if (!contextRef.current) return;
    const ctx = contextRef.current;
    const effectiveSize = selectedTool === 'eraser' ? brushSize * 1.5 : point.pressure * brushSize;

    ctx.lineWidth = effectiveSize;
    ctx.beginPath();
    if (lastPoint) {
      const midPoint = { x: (lastPoint.x + point.x) / 2, y: (lastPoint.y + point.y) / 2 };
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.quadraticCurveTo(midPoint.x, midPoint.y, point.x, point.y);
    } else {
      ctx.arc(point.x, point.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    }
    ctx.stroke();
    if (!lastPoint) ctx.fill();
    hasDrawnRef.current = true;
  };

  const processDrawing = () => {
    if (pointsQueue.current.length < 2) return;
    const points = pointsQueue.current;
    pointsQueue.current = [points[points.length - 1]];
    for (let i = 1; i < points.length; i++) {
      drawPoint(points[i], points[i - 1]);
    }
  };

  const startDrawing = (event) => {
    if (selectedTool !== 'brush' && selectedTool !== 'eraser') return;
    if (!contextRef.current) return;
    if (event.cancelable) event.preventDefault();

    const coords = getCoordinates(event);
    applyBrushSettings(contextRef.current);
    lastPointRef.current = coords;
    pointsQueue.current = [coords];
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing || !contextRef.current) return;
    if (event.cancelable) event.preventDefault();
    const coords = getCoordinates(event);
    pointsQueue.current.push(coords);
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(() => {
        processDrawing();
        animationFrameRef.current = null;
        onCanvasChange();
      });
    }
  };

  const stopDrawing = (event) => {
    if (!isDrawing || !contextRef.current) return;
    if (event && event.cancelable) event.preventDefault();
    processDrawing();
    setIsDrawing(false);
    lastPointRef.current = null;
    pointsQueue.current = [];
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
    });
  };

  const handleDoneDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnRef.current) return;

    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'drawing.jpg', { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(file);
      onDoneDrawing({ blob, objectUrl });
    } catch (error) {
      console.error('Error exporting drawing:', error);
    }
  };

  const handleResetDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const ctx = contextRef.current;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.restore();
    applyBrushSettings(ctx);

    hasDrawnRef.current = false;
    setShowPreview(false);
    onResetDrawing();
    onCanvasChange();
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const items = Array.from(e.dataTransfer.items);
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          try {
            const file = item.getAsFile();
            const imageUrl = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
              const ctx = contextRef.current;
              if (!ctx) return;

              ctx.save();
              ctx.globalAlpha = 1.0;
              ctx.globalCompositeOperation = 'source-over';
              const dpr = window.devicePixelRatio || 1;
              const canvasWidth = canvas.width / dpr;
              const canvasHeight = canvas.height / dpr;
              const scale = Math.min(canvasWidth / image.width, canvasHeight / image.height, 1);
              const x = (canvasWidth - image.width * scale) / 2;
              const y = (canvasHeight - image.height * scale) / 2;

              ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
              ctx.restore();
              applyBrushSettings(ctx);

              hasDrawnRef.current = true;
              URL.revokeObjectURL(imageUrl);
              onCanvasChange();
            };
            image.src = imageUrl;
          } catch (error) {
            console.error('Error loading dropped image:', error);
          }
        }
      }
    };

    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);

    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, [onCanvasChange, brushSize, brushColor, brushOpacity, selectedTool]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 pt-[70px] pb-[70px]">
      <div 
        className="relative w-full max-w-3xl h-[calc(100vh-200px)] sm:h-[65vh] md:h-[70vh] rounded-2xl overflow-hidden transition-all duration-300 ease-out backdrop-blur-xl border-2"
        style={{
          boxShadow: isHovered
            ? '0 12px 40px rgba(255, 120, 200, 0.6), inset 0 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(168, 85, 247, 0.2)'
            : '0 6px 24px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 8px rgba(139, 92, 246, 0.1)',
          background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.98) 0%, rgba(250,245,255,0.95) 100%)',
          borderColor: isHovered ? 'rgba(244, 114, 182, 0.7)' : 'rgba(209, 213, 219, 0.7)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 transform transition-transform duration-1000 ${
              isHovered ? 'translate-x-full' : '-translate-x-full'
            }`}
          />
        </div>
        
        <canvas
          ref={canvasRef}
          className={`w-full h-full touch-none rounded-2xl ${
            selectedTool === 'eraser'
              ? 'cursor-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI5IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=)_10_10,auto]'
              : 'cursor-crosshair'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
        
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 flex items-center justify-center rounded-2xl">
            <div className="bg-white bg-opacity-90 px-6 py-3 rounded-lg shadow-lg">
              <p className="text-blue-600 font-semibold">Drop image here</p>
            </div>
          </div>
        )}
        
        {isProcessing && <ProcessingAnimation />}
      </div>
    </div>
  );
};

export default CanvasArea;