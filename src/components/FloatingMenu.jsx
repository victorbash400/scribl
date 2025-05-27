import React from 'react';

const FloatingMenu = ({ children, title, menuPosition, menuRef }) => (
  <div
    ref={menuRef}
    className="fixed bg-white bg-opacity-95 backdrop-blur-md border border-pink-200 rounded-lg p-1.5 z-50 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
    style={{
      left: `${menuPosition.x}px`,
      top: `${menuPosition.y}px`,
      transform: 'translateX(-50%)',
    }}
  >
    <div className="text-xs font-semibold uppercase tracking-wide text-pink-600 mb-1 px-1">{title}</div>
    {children}
  </div>
);

export default FloatingMenu;