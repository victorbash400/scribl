import React from 'react';

const FloatingMenu = ({ children, title, menuPosition, menuRef }) => (
  <div
    ref={menuRef}
    className="fixed bg-white/80 backdrop-blur-xl border border-pink-100 rounded-2xl p-2 z-50 shadow-2xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4"
    style={{
      left: `${menuPosition.x}px`,
      top: `${menuPosition.y}px`,
      transform: 'translateX(-50%)',
    }}
  >
    <div className="text-[11px] font-medium uppercase tracking-wider text-pink-500 mb-2 px-1.5">
      {title}
    </div>
    {children}
  </div>
);

export default FloatingMenu;
