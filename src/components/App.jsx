import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
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
  const [generatedImage, setGeneratedImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const API_KEY = 'AIzaSyCZu4Dn1H2vOVSEzdxeddDXGLZNpn3--R4';

  const updateCanvasImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      console.log('Updated canvas image:', dataUrl.slice(0, 50) + '...');
      setCanvasImage(dataUrl);
    } catch (error) {
      console.error('Error capturing canvas image:', error);
      setErrorMessage('Failed to capture canvas');
    }
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setCanvasImage(null);
    setShowPreview(false);
    setGeneratedImage(null);
    setErrorMessage('');
  };

  const handleDoneDrawing = () => {
    if (!canvasImage) {
      console.log('No canvas image to preview');
      setErrorMessage('No drawing to preview');
      return;
    }
    setShowPreview(!showPreview);
    console.log('Toggled preview:', !showPreview);
  };

  const handleResetDrawing = () => {
    console.log('Reset drawing called');
    clearCanvas();
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || isProcessing || !canvasImage) {
      if (!canvasImage) setErrorMessage('No drawing to enhance');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const canvas = canvasRef.current;
      console.log('Canvas dimensions before API call:', { width: canvas.width, height: canvas.height });

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const base64Image = canvasImage.split(',')[1];
      if (!base64Image) throw new Error('Invalid canvas image data');
      console.log('Sending base64 image, length:', base64Image.length);

      const contents = [
        {
          text: `Generate an image based on the following description: "${prompt}". ` +
                // Check if the prompt explicitly requests a style change
                (prompt.toLowerCase().includes('change style') || prompt.toLowerCase().includes('new style') || prompt.toLowerCase().includes('different style')
                  ? '' // If user asks to change style, don't enforce "minimal line doodle style"
                  : 'Maintain the minimal line doodle style.')
        },
        { inlineData: { mimeType: 'image/png', data: base64Image } },
      ];
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents,
        config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
      });

      const imageData = response.candidates[0].content.parts.find(part => part.inlineData)?.inlineData.data;
      if (!imageData) throw new Error('No image data in response');
      const imageUrl = `data:image/png;base64,${imageData}`;
      console.log('Generated image URL:', imageUrl.slice(0, 50) + '...');
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage(error.message || 'Failed to generate image');
    } finally {
      setIsProcessing(false);
      setPrompt('');
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_70%_80%,_rgba(219,234,254,0.25)_0%,_transparent_60%)] pointer-events-none" />

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
        generatedImage={generatedImage}
        onCanvasChange={updateCanvasImage}
      />

      <PromptBar
        prompt={prompt}
        setPrompt={setPrompt}
        isProcessing={isProcessing}
        onSubmit={handlePromptSubmit}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default App;