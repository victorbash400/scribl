import React, { useEffect, useRef, useState } from 'react';

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
}) => {
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastPointRef = useRef(null);
  const animationFrameRef = useRef(null);
  const pointsQueue = useRef([]);
  const hasDrawnRef = useRef(false);

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

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      context.globalAlpha = brushOpacity;
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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
  }, [brushColor, brushSize, brushOpacity]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY, pressure;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
      pressure = event.touches[0].force !== undefined ? event.touches[0].force : 0.5;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
      pressure = event.pressure !== undefined ? event.pressure : 0.5;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure,
    };
  };

  const drawPoint = (point, lastPoint) => {
    if (!contextRef.current) return;
    const ctx = contextRef.current;
    const currentPressure = point.pressure * brushSize;

    ctx.lineWidth = selectedTool === 'eraser' ? brushSize * 2 : currentPressure;
    ctx.beginPath();

    if (lastPoint) {
      const midPoint = {
        x: (lastPoint.x + point.x) / 2,
        y: (lastPoint.y + point.y) / 2,
      };
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

    const coords = getCoordinates(event);
    contextRef.current.globalCompositeOperation =
      selectedTool === 'eraser' ? 'destination-out' : 'source-over';
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
      });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;
    processDrawing();
    setIsDrawing(false);
    lastPointRef.current = null;
    pointsQueue.current = [];
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        console.log('Created blob:', blob.type, 'size:', blob.size);
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleDoneDrawing = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnRef.current) {
      console.log('No canvas or no drawing to export');
      return;
    }

    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'drawing.jpg', { type: 'image/jpeg' });
      const objectUrl = URL.createObjectURL(file);
      onDoneDrawing({ blob, objectUrl }); // Pass both blob and objectUrl
    } catch (error) {
      console.error('Error in handleDoneDrawing:', error);
    }
  };

  const handleResetDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const ctx = contextRef.current;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hasDrawnRef.current = false;
    setShowPreview(false);
    onResetDrawing();
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Drag and drop for images onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      e.stopPropagation();
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
              const scale = Math.min(canvas.width / image.width, canvas.height / image.height, 1);
              const x = (canvas.width - image.width * scale) / 2;
              const y = (canvas.height - image.height * scale) / 2;
              ctx.save();
              ctx.globalAlpha = 1.0;
              ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
              ctx.restore();
              hasDrawnRef.current = true;
              URL.revokeObjectURL(imageUrl);
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
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 pt-[60px] pb-[70px]">
      <div className="relative w-full max-w-3xl h-[calc(100vh-200px)] sm:h-[65vh] md:h-[70vh] rounded-xl overflow-hidden shadow-2xl bg-white">
        <canvas
          ref={canvasRef}
          className={`w-full h-full touch-none ${
            selectedTool === 'eraser'
              ? 'cursor-[url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSI5IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=)_10_10,auto]'
              : 'cursor-crosshair'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            if (e.cancelable) e.preventDefault();
            startDrawing(e);
          }}
          onTouchMove={draw}
          onTouchEnd={(e) => {
            if (e.cancelable) e.preventDefault();
            stopDrawing(e);
          }}
          onTouchCancel={(e) => {
            if (e.cancelable) e.preventDefault();
            stopDrawing(e);
          }}
        />
        {isDragging && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-20 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 px-6 py-3 rounded-lg shadow-lg">
              <p className="text-blue-600 font-semibold">Drop image here</p>
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none z-10">
            <div className="w-10 h-10 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <span className="text-md font-semibold text-pink-700 tracking-wide">
              Enhancing with AI...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasArea;