import React, { useState } from 'react';
import { Brush, Eraser, Minus, Plus } from 'lucide-react';
import FloatingMenu from './FloatingMenu';

const BrushSizeMenu = ({ 
  brushSize, 
  setBrushSize, 
  brushColor, 
  selectedTool, 
  setActiveMenu, 
  menuPosition, 
  menuRef 
}) => {
  const [hoveredSize, setHoveredSize] = useState(null);
  
  const brushSizes = [1, 3, 5, 8, 12, 16, 24, 32, 48];
  const quickSizes = selectedTool === 'eraser' ? [5, 12, 24] : [2, 8, 16];

  const handleSizeChange = (newSize) => {
    const clampedSize = Math.max(1, Math.min(50, newSize));
    setBrushSize(clampedSize);
  };

  const getCurrentSizeCategory = () => {
    if (brushSize <= 5) return 'Fine';
    if (brushSize <= 12) return 'Medium';
    if (brushSize <= 24) return 'Large';
    return 'XL';
  };

  return (
    <FloatingMenu title={`${selectedTool === 'eraser' ? 'Eraser' : 'Brush'} Size`} menuPosition={menuPosition} menuRef={menuRef}>
      <div className="w-48">
        {/* Tool indicator */}
        <div className="flex items-center gap-2 mb-2 p-1.5 bg-gray-50 rounded text-xs">
          {selectedTool === 'eraser' ? <Eraser size={10} /> : <Brush size={10} />}
          <span className="text-gray-600">{selectedTool === 'eraser' ? 'Eraser' : 'Brush'}</span>
          <div className="ml-auto flex items-center gap-1">
            <span className="font-medium">{brushSize}px</span>
            <span className="text-gray-500">({getCurrentSizeCategory()})</span>
          </div>
        </div>

        {/* Size adjustment controls */}
        <div className="flex items-center gap-1 mb-2">
          <button
            className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => handleSizeChange(brushSize - 1)}
            disabled={brushSize <= 1}
          >
            <Minus size={10} />
          </button>
          
          <div className="flex-1 px-2">
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => handleSizeChange(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <button
            className="p-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => handleSizeChange(brushSize + 1)}
            disabled={brushSize >= 50}
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Quick size presets */}
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Quick sizes:</div>
          <div className="flex gap-1">
            {quickSizes.map((size) => (
              <button
                key={size}
                className={`px-2 py-1 text-xs rounded border transition-all ${
                  brushSize === size 
                    ? 'bg-pink-100 border-pink-300 text-pink-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setBrushSize(size);
                  setActiveMenu(null);
                }}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* Size preview grid */}
        <div className="grid grid-cols-3 gap-1">
          {brushSizes.map((size) => (
            <div key={size} className="relative">
              <button
                className={`w-full h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 active:scale-95 flex items-center justify-center ${
                  brushSize === size 
                    ? 'border-pink-400 bg-pink-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setBrushSize(size);
                  setActiveMenu(null);
                }}
                onMouseEnter={() => setHoveredSize(size)}
                onMouseLeave={() => setHoveredSize(null)}
              >
                <div
                  className="rounded-full transition-all"
                  style={{
                    width: Math.max(2, Math.min(size * 0.4, 20)),
                    height: Math.max(2, Math.min(size * 0.4, 20)),
                    backgroundColor: selectedTool === 'eraser' ? '#9ca3af' : brushColor,
                    border: selectedTool === 'eraser' ? '1px solid #d1d5db' : 'none'
                  }}
                />
              </button>
              
              {/* Size label */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 bg-white px-1 rounded">
                {size}
              </div>
              
              {hoveredSize === size && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {size}px {size <= 5 ? 'Fine' : size <= 12 ? 'Medium' : size <= 24 ? 'Large' : 'XL'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #ec4899;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .slider::-moz-range-thumb {
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #ec4899;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>
    </FloatingMenu>
  );
};

export default BrushSizeMenu;