import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const wildSuggestions = [
	'add dragon wings',
	'turn sky brown',
	'make it pinkerrr',
	'add neon horns to the cat',
	'remove background, keep shadows',
	'give them glowing robot eyes',
	'make water look like lava',
	'add graffiti to the wall',
	'turn this into an album cover',
	'make it rainy and cyberpunk',
];

const PromptBar = ({ prompt, setPrompt, isProcessing, onSubmit, errorMessage }) => {
	const [isFocused, setIsFocused] = useState(false);
	const [suggestionIndex, setSuggestionIndex] = useState(0);

	useEffect(() => {
		// Only cycle suggestions when not focused and no text entered
		if (!isFocused && !prompt.trim()) {
			const interval = setInterval(() => {
				setSuggestionIndex((prev) => (prev + 1) % wildSuggestions.length);
			}, 4000);
			return () => clearInterval(interval);
		}
	}, [isFocused, prompt]);

	const onKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<motion.div 
			className="fixed bottom-5 left-0 right-0 flex justify-center px-4 z-50"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
		>
			<div className="w-full max-w-3xl">
				<AnimatePresence>
					{errorMessage && (
						<motion.div 
							className="mb-2 bg-red-500 text-white text-sm font-medium p-2 rounded-lg shadow-lg"
							initial={{ opacity: 0, y: -10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -10, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
						>
							{errorMessage}
						</motion.div>
					)}
				</AnimatePresence>
				
				<motion.div
					className="relative flex items-center px-5 py-2.5 rounded-2xl transition-all duration-300 ease-out backdrop-blur-xl border-2 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.98)_0%,_rgba(250,245,255,0.95)_100%)] ring-2 ring-gray-200/50"
					animate={{
						borderColor: isFocused ? 'rgba(244, 114, 182, 0.7)' : 'rgba(209, 213, 219, 0.7)',
						boxShadow: isFocused
							? '0 12px 40px rgba(255, 120, 200, 0.6), inset 0 2px 4px rgba(255,255,255,0.8), 0 0 20px rgba(168, 85, 247, 0.2)'
							: '0 6px 24px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 8px rgba(139, 92, 246, 0.1)',
					}}
					transition={{ duration: 0.2 }}
				>
					{/* Shimmer effect */}
					<AnimatePresence>
						{isProcessing && (
							<motion.div 
								className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 transform"
									initial={{ x: '-100%' }}
									animate={{ x: '200%' }}
									transition={{ 
										repeat: Infinity, 
										duration: 1.5, 
										ease: "linear" 
									}}
								/>
							</motion.div>
						)}
					</AnimatePresence>

					<div className="relative flex-grow">
						<textarea
							rows={1}
							key={suggestionIndex}
							placeholder={`Try: "${wildSuggestions[suggestionIndex]}"`}
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={onKeyDown}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							className="w-full resize-none bg-transparent outline-none border-none text-sm text-gray-900 placeholder-gray-500/80 font-medium"
							style={{ maxHeight: 80 }}
						/>
					</div>

					<AnimatePresence>
						{prompt.trim() && (
							<motion.button
								onClick={() => setPrompt('')}
								className="ml-2 p-2 rounded-lg bg-white/80 hover:bg-white/95 text-gray-600 hover:text-red-600 transition-colors duration-200 shadow-md border border-gray-200/50"
								aria-label="Clear prompt"
								initial={{ opacity: 0, scale: 0.8, x: 10 }}
								animate={{ opacity: 1, scale: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.8, x: 10 }}
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 17 }}
							>
								<X size={16} />
							</motion.button>
						)}
					</AnimatePresence>

					<motion.button
						onClick={onSubmit}
						disabled={!prompt.trim() || isProcessing}
						className="ml-3 w-10 h-10 bg-gradient-to-br from-pink-600 via-fuchsia-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors duration-300 shadow-lg"
						aria-label="Submit prompt"
						whileHover={{ 
							scale: prompt.trim() && !isProcessing ? 1.05 : 1
						}}
						whileTap={{ scale: 0.98 }}
						animate={{ 
							boxShadow: isProcessing 
								? '0 0 20px rgba(168, 85, 247, 0.6)' 
								: '0 4px 14px rgba(0,0,0,0.25)'
						}}
						transition={{ 
							scale: { type: "spring", stiffness: 400, damping: 17 },
							boxShadow: { duration: 0.3 }
						}}
					>
						<AnimatePresence mode="wait">
							{isProcessing ? (
								<motion.div 
									key="processing"
									className="relative flex items-center justify-center"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.2 }}
								>
									<motion.div 
										className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
										animate={{ rotate: 360 }}
										transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									/>
									<motion.div
										className="absolute w-4 h-4 border-2 border-transparent border-r-white/70 rounded-full"
										animate={{ rotate: -360 }}
										transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
									/>
								</motion.div>
							) : (
								<motion.div
									key="sparkles"
									initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
									animate={{ opacity: 1, scale: 1, rotate: 0 }}
									exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
									transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
								>
									<Sparkles size={16} className="text-white drop-shadow-lg" />
								</motion.div>
							)}
						</AnimatePresence>
					</motion.button>
				</motion.div>
			</div>

			{/* Floating particles */}
			<AnimatePresence>
				{isFocused && (
					<>
						<motion.div 
							className="absolute -top-3 left-12 w-2 h-2 bg-pink-400 rounded-full"
							initial={{ opacity: 0, y: 10, scale: 0 }}
							animate={{ 
								opacity: 0.8, 
								y: [-12, -16, -12], 
								scale: [0.8, 1, 0.8] 
							}}
							exit={{ opacity: 0, y: 10, scale: 0 }}
							transition={{ 
								y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
								scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
								opacity: { duration: 0.3 }
							}}
						/>
						<motion.div 
							className="absolute -top-2 right-16 w-1.5 h-1.5 bg-purple-400 rounded-full"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ 
								opacity: [0.7, 1, 0.7], 
								scale: [0.8, 1.2, 0.8] 
							}}
							exit={{ opacity: 0, scale: 0 }}
							transition={{ 
								opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
								scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
							}}
						/>
						<motion.div 
							className="absolute -bottom-1 left-20 w-1 h-1 bg-fuchsia-400 rounded-full"
							initial={{ opacity: 0, scale: 0 }}
							animate={{ 
								opacity: [0.6, 1, 0.6], 
								scale: [0.5, 1.5, 0.5] 
							}}
							exit={{ opacity: 0, scale: 0 }}
							transition={{ 
								opacity: { duration: 1, repeat: Infinity, ease: "easeInOut" },
								scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
							}}
						/>
					</>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default PromptBar;