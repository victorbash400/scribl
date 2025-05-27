import React, { useState } from 'react';
import { Palette, Droplet, Sparkles, Check } from 'lucide-react';
import FloatingMenu from './FloatingMenu';

const ColorPaletteMenu = ({ 
  brushColor, 
  setBrushColor, 
  setActiveMenu, 
  menuPosition, 
  menuRef 
}) => {
  const [hoveredColor, setHoveredColor] = useState(null);
  
  const colorPalettes = {
    vibrant: {
      name: 'Vibrant',
      icon: <Sparkles size={8} />,
      colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06ffa5', '#ff4081', '#00bcd4']
    },
    classic: {
      name: 'Classic',
      icon: <Palette size={8} />,
      colors: ['#2d1b69', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#000000', '#6b7280']
    },
    pastel: {
      name: 'Pastel',
      icon: <Droplet size={8} />,
      colors: ['#fce7f3', '#fed7d7', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#f3f4f6', '#FFFFFF']
    }
  };

  const [activePalette, setActivePalette] = useState('classic');

  const handleColorSelect = (color) => {
    setBrushColor(color);
    setActiveMenu(null);
  };

  const getColorName = (color) => {
    const colorNames = {
      '#ff006e': 'Hot Pink', '#fb5607': 'Orange', '#ffbe0b': 'Yellow', '#8338ec': 'Purple',
      '#3a86ff': 'Blue', '#06ffa5': 'Mint', '#ff4081': 'Pink', '#00bcd4': 'Cyan',
      '#2d1b69': 'Deep Purple', '#ec4899': 'Pink', '#f97316': 'Orange', '#10b981': 'Green',
      '#3b82f6': 'Blue', '#8b5cf6': 'Violet', '#000000': 'Black', '#6b7280': 'Gray',
      '#fce7f3': 'Light Pink', '#fed7d7': 'Light Red', '#fef3c7': 'Light Yellow',
      '#d1fae5': 'Light Green', '#dbeafe': 'Light Blue', '#e0e7ff': 'Light Purple',
      '#f3f4f6': 'Light Gray', '#FFFFFF': 'White'
    };
    return colorNames[color] || color;
  };

  return (
    <FloatingMenu title="Color Palette" menuPosition={menuPosition} menuRef={menuRef}>
      <div className="w-44">
        {/* Compact Palette Tabs */}
        <div className="flex gap-0.5 mb-2 p-0.5 bg-gray-50 rounded text-xs">
          {Object.entries(colorPalettes).map(([key, palette]) => (
            <button
              key={key}
              className={`flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-all ${
                activePalette === key 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActivePalette(key)}
            >
              {palette.icon}
              <span className="text-xs">{palette.name}</span>
            </button>
          ))}
        </div>

        {/* Compact Color Grid */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          {colorPalettes[activePalette].colors.map((color, index) => (
            <div key={`${color}-${index}`} className="relative">
              <button
                className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 active:scale-95 ${
                  brushColor === color 
                    ? 'border-pink-400 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleColorSelect(color)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{ 
                  backgroundColor: color,
                  boxShadow: brushColor === color ? `0 2px 8px ${color}40` : undefined
                }}
              >
                {brushColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={10} className={color === '#FFFFFF' || color.includes('f') ? 'text-gray-800' : 'text-white'} />
                  </div>
                )}
              </button>
              
              {hoveredColor === color && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {getColorName(color)}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compact Current Color Display */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs">
          <div 
            className="w-4 h-4 rounded border border-gray-200"
            style={{ backgroundColor: brushColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{getColorName(brushColor)}</div>
          </div>
        </div>
      </div>
    </FloatingMenu>
  );
};

export default ColorPaletteMenu;