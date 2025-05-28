import React, { useState } from 'react';
import { Palette, Droplet, Sparkles, Check } from 'lucide-react';
import FloatingMenu from './FloatingMenu';
import { motion, AnimatePresence } from 'framer-motion';

const ColorPaletteMenu = ({ brushColor, setBrushColor, setActiveMenu, menuPosition, menuRef }) => {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [activePalette, setActivePalette] = useState('classic');

  const colorPalettes = {
    vibrant: {
      name: 'Vibrant',
      icon: <Sparkles />,
      colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06ffa5', '#ff4081', '#00bcd4']
    },
    classic: {
      name: 'Classic',
      icon: <Palette />,
      colors: ['#2d1b69', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#000000', '#6b7280']
    },
    pastel: {
      name: 'Pastel',
      icon: <Droplet />,
      colors: ['#fce7f3', '#fed7d7', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#f3f4f6', '#FFFFFF']
    }
  };

  const getColorName = (color) => {
    const names = {
      '#ff006e': 'Hot Pink', '#fb5607': 'Orange', '#ffbe0b': 'Yellow', '#8338ec': 'Purple',
      '#3a86ff': 'Blue', '#06ffa5': 'Mint', '#ff4081': 'Pink', '#00bcd4': 'Cyan',
      '#2d1b69': 'Deep Purple', '#ec4899': 'Pink', '#f97316': 'Orange', '#10b981': 'Green',
      '#3b82f6': 'Blue', '#8b5cf6': 'Violet', '#000000': 'Black', '#6b7280': 'Gray',
      '#fce7f3': 'Light Pink', '#fed7d7': 'Light Red', '#fef3c7': 'Light Yellow',
      '#d1fae5': 'Light Green', '#dbeafe': 'Light Blue', '#e0e7ff': 'Light Purple',
      '#f3f4f6': 'Light Gray', '#ffffff': 'White'
    };
    return names[color.toLowerCase()] || color;
  };

  const isLightColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  const checkColorClass = isLightColor(brushColor) ? 'text-neutral-800' : 'text-white';

  return (
    <FloatingMenu title="Color Palette" menuPosition={menuPosition} menuRef={menuRef}>
      <motion.div
        className="w-44"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex gap-1 mb-2 p-1 bg-white/60 backdrop-blur-md border border-neutral-200 rounded-xl text-xs shadow-inner">
          {Object.entries(colorPalettes).map(([key, { name, icon }]) => (
            <button
              key={key}
              onClick={() => setActivePalette(key)}
              title={name}
              className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md transition-all duration-200 ease-out ${
                activePalette === key
                  ? 'bg-white text-pink-600 shadow-sm ring-1 ring-pink-400/30'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              {React.cloneElement(icon, { size: 14 })}
              <span className="text-[11px] font-medium">{name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {colorPalettes[activePalette].colors.map((color, index) => (
            <motion.div key={`${color}-${index}`} layout className="relative flex justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`w-8 h-8 rounded-xl border focus:outline-none transition-all duration-200 ease-out ${
                  brushColor === color
                    ? 'border-pink-500 ring-2 ring-pink-400 ring-offset-2 ring-offset-white'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow: brushColor === color ? `0 2px 6px ${color}60` : '0 1px 2px rgba(0,0,0,0.05)'
                }}
                onClick={() => {
                  setBrushColor(color);
                  setActiveMenu(null);
                }}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
              >
                {brushColor === color && (
                  <motion.div
                    layoutId="checkmark"
                    className="absolute inset-0 flex items-center justify-center"
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check size={14} className={checkColorClass} strokeWidth={2.5} />
                  </motion.div>
                )}
              </motion.button>

              <AnimatePresence>
                {hoveredColor === color && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs font-medium rounded-md shadow-md z-50"
                  >
                    {getColorName(color)}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-neutral-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm border border-neutral-200 rounded-xl text-sm">
          <div
            className="w-5 h-5 rounded-lg border border-neutral-300 shadow-inner"
            style={{ backgroundColor: brushColor }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-neutral-700 truncate">{getColorName(brushColor)}</div>
          </div>
        </div>
      </motion.div>
    </FloatingMenu>
  );
};

export default ColorPaletteMenu;
