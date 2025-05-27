import React, { useRef, useEffect, useState } from 'react';

const FloatingPreview = ({ 
  previewPosition, 
  setPreviewPosition, 
  setShowPreview, 
  canvasImage, 
  onDragStart 
}) => {
  const previewRef = useRef(null);
  const previewImageRef = useRef(null);
  const dragRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle dragging of preview window
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragRef.current) {
        setPreviewPosition((prev) => ({
          x: prev.x + e.movementX,
          y: prev.y + e.movementY,
        }));
      }
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = false;
        setIsDragging(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setPreviewPosition]);

  // Set up drag functionality when preview image is rendered
  useEffect(() => {
    if (canvasImage && previewImageRef.current) {
      console.log('Setting up drag for preview image');
      
      const setupDragToDocument = async () => {
        if (window.addOnUISdk) {
          try {
            await window.addOnUISdk.ready;
            
            await window.addOnUISdk.app.enableDragToDocument(previewImageRef.current, {
              previewCallback: (element) => {
                console.log('Preview callback called');
                return new URL(element.src);
              },
              completionCallback: async () => {
                console.log('Completion callback called');
                try {
                  const response = await fetch(canvasImage);
                  const blob = await response.blob();
                  return [{
                    blob,
                    attributes: {
                      title: 'Canvas Drawing'
                    }
                  }];
                } catch (error) {
                  console.error('Error creating blob:', error);
                  throw error;
                }
              }
            });

            console.log('Drag to document enabled for preview');
          } catch (error) {
            console.error('Error setting up drag to document:', error);
          }
        }
      };

      setupDragToDocument();
    }
  }, [canvasImage]);

  const handleDragStart = () => {
    dragRef.current = true;
    setIsDragging(true);
  };

  const handleImageMouseDown = (e) => {
    e.stopPropagation();
    setIsImageDragging(true);
  };

  const handleImageMouseUp = () => {
    setIsImageDragging(false);
  };

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-40 transition-all duration-300"
        onClick={() => setShowPreview(false)}
      />
      
      <div
        ref={previewRef}
        className={`fixed z-50 transition-all duration-300 ${
          isDragging ? 'scale-105 rotate-1' : 'scale-100 rotate-0'
        }`}
        style={{
          left: `${previewPosition.x}px`,
          top: `${previewPosition.y}px`,
          userSelect: 'none',
          filter: 'drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))',
        }}
      >
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 p-[2px] animate-pulse">
          <div className="h-full w-full rounded-2xl bg-white/95 backdrop-blur-xl" />
        </div>
        
        {/* Main content */}
        <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl p-6 max-w-[320px] border border-white/50">
          
          {/* Header with drag handle */}
          <div
            className={`flex justify-between items-center mb-4 cursor-move select-none transition-all duration-200 ${
              isDragging ? 'scale-95' : 'scale-100'
            }`}
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
                PREVIEW
              </span>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="group relative w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
              title="Close Preview"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:rotate-90 transition-transform duration-200"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-150" />
            </button>
          </div>

          {/* Image container */}
          {canvasImage ? (
            <div className="relative group">
              {/* Loading state */}
              {!isLoaded && (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              
              {/* Main image */}
              <div className={`relative overflow-hidden rounded-xl transition-all duration-300 ${!isLoaded ? 'opacity-0 absolute' : 'opacity-100'}`}>
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                
                <img
                  ref={previewImageRef}
                  id={`canvas-drawing-${Date.now()}`}
                  src={canvasImage}
                  alt="Canvas Preview"
                  className={`w-full h-auto rounded-xl border-2 border-white/50 shadow-2xl transition-all duration-300 ${
                    isImageDragging 
                      ? 'cursor-grabbing scale-95 rotate-2 shadow-3xl' 
                      : 'cursor-grab hover:scale-[1.02] hover:-rotate-1 hover:shadow-3xl'
                  }`}
                  style={{ 
                    maxWidth: '280px',
                    filter: 'contrast(1.05) saturate(1.1)',
                  }}
                  onMouseDown={handleImageMouseDown}
                  onMouseUp={handleImageMouseUp}
                  onLoad={() => setIsLoaded(true)}
                />
                
                {/* Drag indicator */}
                <div className={`absolute top-2 right-2 bg-black/20 backdrop-blur-md rounded-full p-2 transition-all duration-200 ${
                  isImageDragging ? 'scale-110' : 'scale-100 hover:scale-105'
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-80"
                  >
                    <path d="M12 2l3 3-3 3" />
                    <path d="M12 22l-3-3 3-3" />
                    <path d="M2 12l3-3 3 3" />
                    <path d="M22 12l-3 3-3-3" />
                  </svg>
                </div>
              </div>
              
              {/* Instruction text */}
              <div className="mt-4 text-center">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  ✨ Drag to Adobe Express
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <div className="w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <div className="w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">No preview available</p>
            </div>
          )}
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-30" />
        <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-40" style={{animationDelay: '500ms'}} />
        <div className="absolute top-1/2 -left-3 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-25" style={{animationDelay: '1000ms'}} />
      </div>
    </>
  );
};

export default FloatingPreview;