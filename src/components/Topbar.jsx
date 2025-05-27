import React, { useState, useRef, useEffect } from 'react';
import { 
  History, 
  Paintbrush, 
  Eraser, 
  Circle, 
  Palette, 
  Eye, 
  RotateCcw, 
  Check 
} from 'lucide-react';
import FloatingPreview from './FloatingPreview';
import VersionHistoryMenu from './VersionHistoryMenu';
import BrushSizeMenu from './BrushSizeMenu';
import ColorPaletteMenu from './ColorPaletteMenu';
import ToolButton from './ToolButton';
import ActionButton from './ActionButton';

const Tooltip = ({ children, content, show }) => {
  if (!show) return children;
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

const Topbar = ({
  versions,
  setVersions,
  selectedTool,
  setSelectedTool,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  clearCanvas,
  onDoneDrawing,
  onResetDrawing,
  showPreview,
  setShowPreview,
  canvasImage,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = useState({ x: 50, y: 100 });
  const [hoveredButton, setHoveredButton] = useState(null);
  const menuRef = useRef(null);
  const scrollRef = useRef(null);

  // Handle clicks outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setActiveMenu(activeMenu === menuType ? null : menuType);
  };

  return (
    <>
      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 w-auto max-w-[calc(100vw-24px)] z-20">
        <div className="relative group">
          {/* Gradient fade edges for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent backdrop-blur-sm z-10 pointer-events-none rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent backdrop-blur-sm z-10 pointer-events-none rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div 
            ref={scrollRef}
            className="flex items-center gap-0.5 bg-white/80 backdrop-blur-xl border border-pink-100/60 rounded-xl px-2 py-1 shadow-lg shadow-pink-100/30 overflow-x-auto scrollbar-hide hover:bg-white/90 transition-all duration-300"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {/* History Button */}
            <Tooltip content="History" show={hoveredButton === 'history'}>
              <ActionButton
                title="Version History"
                onClick={(e) => handleMenuClick('versions', e)}
                onMouseEnter={() => setHoveredButton('history')}
                onMouseLeave={() => setHoveredButton(null)}
                className={`${activeMenu === 'versions' ? 'bg-pink-50 text-pink-600' : ''} px-2 py-1.5 min-w-0`}
              >
                <History size={14} />
              </ActionButton>
            </Tooltip>

            <div className="w-px h-3 bg-pink-150 mx-0.5"></div>

            {/* Drawing Tools */}
            <div className="flex gap-0.5">
              <Tooltip content="Brush (B)" show={hoveredButton === 'brush'}>
                <ToolButton
                  title="Brush Tool"
                  isActive={selectedTool === 'brush'}
                  onClick={() => setSelectedTool('brush')}
                  onMouseEnter={() => setHoveredButton('brush')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="px-2 py-1.5"
                >
                  <Paintbrush size={14} />
                </ToolButton>
              </Tooltip>
              
              <Tooltip content="Eraser (E)" show={hoveredButton === 'eraser'}>
                <ToolButton
                  title="Eraser Tool"
                  isActive={selectedTool === 'eraser'}
                  onClick={() => setSelectedTool('eraser')}
                  onMouseEnter={() => setHoveredButton('eraser')}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="px-2 py-1.5"
                >
                  <Eraser size={14} />
                </ToolButton>
              </Tooltip>
            </div>

            <div className="w-px h-3 bg-pink-150 mx-0.5"></div>

            {/* Brush Settings */}
            <Tooltip content="Size" show={hoveredButton === 'size'}>
              <ActionButton
                title="Brush Size"
                onClick={(e) => handleMenuClick('brush', e)}
                onMouseEnter={() => setHoveredButton('size')}
                onMouseLeave={() => setHoveredButton(null)}
                className={`${activeMenu === 'brush' ? 'bg-pink-50 text-pink-600' : ''} px-2 py-1.5 min-w-0`}
              >
                <div className="relative">
                  <Circle size={14} className="opacity-50" />
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: Math.max(2, Math.min(brushSize * 0.3, 7)),
                      height: Math.max(2, Math.min(brushSize * 0.3, 7)),
                      backgroundColor: selectedTool === 'eraser' ? '#FFFFFF' : brushColor,
                      border: selectedTool === 'eraser' ? '1px solid #D1D5DB' : 'none'
                    }}
                  />
                </div>
              </ActionButton>
            </Tooltip>

            {/* Color Picker */}
            <Tooltip content={selectedTool === 'eraser' ? 'Color (eraser mode)' : 'Color'} show={hoveredButton === 'color'}>
              <ActionButton
                title="Color Palette"
                onClick={(e) => handleMenuClick('colors', e)}
                onMouseEnter={() => setHoveredButton('color')}
                onMouseLeave={() => setHoveredButton(null)}
                disabled={selectedTool === 'eraser'}
                className={`${activeMenu === 'colors' ? 'bg-pink-50 text-pink-600' : ''} ${
                  selectedTool === 'eraser' ? 'opacity-40' : ''
                } px-2 py-1.5 min-w-0`}
              >
                <div className="relative">
                  <Palette size={14} />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: selectedTool === 'eraser' ? '#D1D5DB' : brushColor }}
                  />
                </div>
              </ActionButton>
            </Tooltip>

            <div className="w-px h-3 bg-pink-150 mx-0.5"></div>

            {/* Preview Action */}
            <Tooltip content="Preview" show={hoveredButton === 'preview'}>
              <ToolButton
                title="Preview Drawing"
                isActive={showPreview}
                onClick={() => setShowPreview(!showPreview)}
                onMouseEnter={() => setHoveredButton('preview')}
                onMouseLeave={() => setHoveredButton(null)}
                className={`${showPreview ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-500'} ${
                  !canvasImage ? 'opacity-30' : ''
                } px-2 py-1.5`}
              >
                <Eye size={14} />
              </ToolButton>
            </Tooltip>

            <div className="w-px h-3 bg-pink-150 mx-0.5"></div>

            {/* Completion Actions */}
            <div className="flex gap-0.5">
              <Tooltip content="Reset" show={hoveredButton === 'reset'}>
                <ActionButton
                  title="Reset Drawing"
                  onClick={onResetDrawing}
                  onMouseEnter={() => setHoveredButton('reset')}
                  onMouseLeave={() => setHoveredButton(null)}
                  variant="warning"
                  className="px-2 py-1.5 min-w-0"
                >
                  <RotateCcw size={14} />
                </ActionButton>
              </Tooltip>
              
              <Tooltip content="Done" show={hoveredButton === 'done'}>
                <ActionButton
                  title="Complete Drawing"
                  onClick={onDoneDrawing}
                  onMouseEnter={() => setHoveredButton('done')}
                  onMouseLeave={() => setHoveredButton(null)}
                  variant="success"
                  className="px-2 py-1.5 min-w-0"
                >
                  <Check size={14} />
                </ActionButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Menus */}
      {activeMenu === 'versions' && (
        <VersionHistoryMenu 
          versions={versions} 
          menuPosition={menuPosition} 
          menuRef={menuRef} 
        />
      )}

      {activeMenu === 'brush' && (
        <BrushSizeMenu
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushColor={brushColor}
          selectedTool={selectedTool}
          setActiveMenu={setActiveMenu}
          menuPosition={menuPosition}
          menuRef={menuRef}
        />
      )}

      {activeMenu === 'colors' && (
        <ColorPaletteMenu
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          setActiveMenu={setActiveMenu}
          menuPosition={menuPosition}
          menuRef={menuRef}
        />
      )}

      {/* Floating Preview Window */}
      {showPreview && canvasImage && (
        <FloatingPreview
          previewPosition={previewPosition}
          setPreviewPosition={setPreviewPosition}
          setShowPreview={setShowPreview}
          canvasImage={canvasImage}
        />
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default Topbar;