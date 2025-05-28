import React from 'react';
import { motion } from 'framer-motion';

const ProcessingAnimation = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none">
      {/* Ambient gradient blobs */}
      <motion.div
        className="absolute w-40 h-40 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-50 filter blur-2xl"
        animate={{
          x: [0, 100, -60, 0],
          y: [0, -100, 80, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-32 h-32 bg-gradient-to-l from-blue-400 to-cyan-500 rounded-full opacity-40 filter blur-2xl"
        animate={{
          x: [0, -120, 90, 0],
          y: [0, 60, -80, 0],
          scale: [1.1, 0.8, 1.3, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />

      {/* Spinner ring — sleeker */}
      <motion.div
        className="relative z-10 w-16 h-16 border-[3px] border-t-transparent border-r-transparent border-white/70 rounded-full animate-spin"
        style={{
          animationDuration: '1.2s',
        }}
      />

      {/* Inner soft glow ping */}
      <motion.div
        className="absolute z-0 w-6 h-6 bg-white rounded-full opacity-50"
        animate={{
          scale: [0.8, 1.6],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />

      {/* Text: Just a sec... with shimmer fade */}
      <motion.div
        className="absolute bottom-20 text-lg font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        Just a sec...
      </motion.div>
    </div>
  );
};

export default ProcessingAnimation;
