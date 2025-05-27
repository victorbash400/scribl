import React from 'react';

const ActionButton = ({ title, onClick, children, variant = 'default', disabled = false, className = '' }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'text-gray-500 hover:bg-red-50 hover:text-red-600';
      case 'info':
        return 'text-gray-500 hover:bg-blue-50 hover:text-blue-600';
      case 'warning':
        return 'text-gray-600 hover:bg-orange-50 hover:text-orange-600';
      case 'success':
        return 'text-gray-600 hover:bg-green-50 hover:text-green-600';
      default:
        return 'text-gray-600 hover:bg-pink-50 hover:text-pink-600';
    }
  };

  return (
    <button
      title={title}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${getVariantClasses()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ActionButton;