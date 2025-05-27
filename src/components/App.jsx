import React, { useState, useRef } from 'react';
import Topbar from './Topbar';
import CanvasArea from './CanvasArea';
import PromptBar from './PromptBar';

const App = () => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#2d1b69');
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [canvasImage, setCanvasImage] = useState(null);
  const [prompt, setPrompt] = useState('');

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear preview when canvas is cleared
    setCanvasImage(null);
    setShowPreview(false);
  };

  const handleDoneDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create the data URL
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('Created canvas data URL');
      
      // Set the canvas image and show preview
      setCanvasImage(dataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error capturing canvas:', error);
    }
  };

  const handleResetDrawing = () => {
    console.log('Reset drawing called');
    clearCanvas();
    setCanvasImage(null);
    setShowPreview(false);
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim() || isProcessing) return;
    
    setIsProcessing(true);
    // Here you would typically send the prompt and canvas data to your AI service
    // For now, we'll just simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setPrompt('');
    }, 2000);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col overflow-hidden">
      <Topbar
        versions={versions}
        setVersions={setVersions}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        clearCanvas={clearCanvas}
        onDoneDrawing={handleDoneDrawing}
        onResetDrawing={handleResetDrawing}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        canvasImage={canvasImage}
        
      />
      
      <CanvasArea
        canvasRef={canvasRef}
        selectedTool={selectedTool}
        brushColor={brushColor}
        brushSize={brushSize}
        brushOpacity={brushOpacity}
        isProcessing={isProcessing}
        onDoneDrawing={handleDoneDrawing}
        onResetDrawing={handleResetDrawing}
        setShowPreview={setShowPreview}
      />

      <PromptBar
        prompt={prompt}
        setPrompt={setPrompt}
        isProcessing={isProcessing}
        onSubmit={handlePromptSubmit}
      />
    </div>
  );
};

export default App;