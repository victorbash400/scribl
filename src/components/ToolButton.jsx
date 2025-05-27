import React from 'react';

const ToolButton = ({ isActive, title, onClick, children, className = '' }) => (
  <button
    title={title}
    className={`p-1.5 rounded-lg transition-all ${
      isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default ToolButton;
