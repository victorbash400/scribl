import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const PromptBar = ({ prompt, setPrompt, isProcessing, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isProcessing) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-20">
      <div className={`relative bg-gradient-to-r from-white/90 via-pink-50/95 to-white/90 backdrop-blur-xl border-2 ${
        isFocused ? 'border-pink-400 shadow-2xl shadow-pink-500/25' : 'border-pink-200/60'
      } rounded-2xl flex items-center px-5 py-3 transition-all duration-500 ease-out transform ${
        isFocused ? 'scale-[1.02]' : 'scale-100'
      } hover:shadow-xl hover:shadow-pink-500/20 ${
        isAnimating ? 'animate-pulse' : ''
      }`}>
        
        {/* Animated gradient overlay */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-400/10 via-purple-400/10 to-pink-400/10 opacity-0 transition-opacity duration-500 ${
          isFocused ? 'opacity-100' : ''
        }`} />
        
        {/* Floating particles effect */}
        {isFocused && (
          <>
            <div className="absolute -top-2 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="absolute -top-1 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -top-2 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          </>
        )}

        <div className="relative flex-grow">
          <textarea
            rows={1}
            placeholder="✨ Transform your vision..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full resize-none bg-transparent outline-none border-none text-sm text-gray-800 placeholder-pink-400/70 pr-2 font-medium"
            style={{ maxHeight: 100 }}
          />
        </div>

        {prompt.trim() && (
          <button
            onClick={() => setPrompt('')}
            className="ml-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-pink-100 hover:to-red-100 text-pink-500 hover:text-red-500 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
            aria-label="Clear prompt"
          >
            <X size={16} />
          </button>
        )}

        <button
          onClick={onSubmit}
          disabled={!prompt.trim() || isProcessing}
          className={`ml-3 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-pink-500/50 ${
            isProcessing ? 'animate-pulse' : ''
          }`}
          aria-label="Submit prompt"
        >
          {isProcessing ? (
            <div className="relative">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <div className="absolute inset-0 w-5 h-5 border-2 border-transparent border-r-white/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            </div>
          ) : (
            <Sparkles size={18} className="text-white drop-shadow-sm" />
          )}
        </button>

        {/* Shimmer effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 transition-transform duration-1000 ${
          isAnimating ? 'translate-x-full' : '-translate-x-full'
        }`} />
      </div>
    </div>
  );
};

export default PromptBar;