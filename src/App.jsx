import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setEnhancedImage(null); 
    }
  };


  const enhanceImage = () => {
    if (!selectedImage) return;
    setLoading(true);

    
    const img = new Image();
    img.src = URL.createObjectURL(selectedImage);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      
      canvas.width = img.width;
      canvas.height = img.height;

      
      ctx.drawImage(img, 0, 0);

      
      enhanceCanvasImage(ctx, img.width, img.height);

    
      const enhancedDataUrl = canvas.toDataURL('image/png');
      setEnhancedImage(enhancedDataUrl);

      setLoading(false);
    };
  };

  
  const enhanceCanvasImage = (ctx, width, height) => {
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] * 1.1; 
      data[i + 1] = data[i + 1] * 1.1; 
      data[i + 2] = data[i + 2] * 1.1; 
    }

    const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);

    const src = data.slice();
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = Math.min(height - 1, Math.max(0, y + cy - halfSide));
            const scx = Math.min(width - 1, Math.max(0, x + cx - halfSide));
            const srcOffset = (scy * width + scx) * 4;
            const wt = weights[cy * side + cx];
            r += src[srcOffset] * wt;
            g += src[srcOffset + 1] * wt;
            b += src[srcOffset + 2] * wt;
          }
        }
        const dstOffset = (y * width + x) * 4;
        data[dstOffset] = Math.min(Math.max(r, 0), 255);
        data[dstOffset + 1] = Math.min(Math.max(g, 0), 255);
        data[dstOffset + 2] = Math.min(Math.max(b, 0), 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const downloadEnhancedImage = () => {
    if (!enhancedImage) return;

    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = 'enhanced-image.png';
    link.click();
  };

  return (
    <div className="App">
      <h1>Image Enhancement Tool</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />

      {selectedImage && (
        <div className="image-container">
          <h2>Original Image</h2>
          <img src={URL.createObjectURL(selectedImage)} alt="Original" className="original-image" />
        </div>
      )}

      <button onClick={enhanceImage} disabled={!selectedImage || loading}>
        {loading ? 'Enhancing...' : 'Enhance Image'}
      </button>

      {enhancedImage && (
        <div className="image-container">
          <h2>Enhanced Image</h2>
          <img src={enhancedImage} alt="Enhanced" className="enhanced-image" />
          <button onClick={downloadEnhancedImage}>Download Enhanced Image</button>
        </div>
      )}
    </div>
  );
}

export default App;
