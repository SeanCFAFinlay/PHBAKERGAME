import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import './AIPreviewPanel.css';

export const AIPreviewPanel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [transparencyThreshold, setTransparencyThreshold] = useState(128);
  const [anchorX, setAnchorX] = useState(0.5);
  const [anchorY, setAnchorY] = useState(0.5);
  const [billboardMode, setBillboardMode] = useState(true);
  const [spriteMode, setSpriteMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [padding, setPadding] = useState(0);
  const [outline, setOutline] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#0a0c12');
  const [showGrid, setShowGrid] = useState(true);
  const [turntable, setTurntable] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup Three.js scene with same camera as game
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    
    const camera = new THREE.PerspectiveCamera(
      50, // Same FOV as game
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 12, 15); // Same camera position as game
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Add grid if enabled
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(10, 10);
      gridHelper.material.opacity = 0.2;
      gridHelper.material.transparent = true;
      scene.add(gridHelper);
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (turntable && cameraRef.current) {
        cameraRef.current.position.x = Math.sin(Date.now() * 0.001) * 15;
        cameraRef.current.position.z = Math.cos(Date.now() * 0.001) * 15;
        cameraRef.current.lookAt(0, 0, 0);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [backgroundColor, showGrid, turntable]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const processAndSave = () => {
    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }

    // Create a canvas for image processing
    const processCanvas = document.createElement('canvas');
    const ctx = processCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const cropWidth = (img.width * cropRect.width) / 100;
      const cropHeight = (img.height * cropRect.height) / 100;
      const cropX = (img.width * cropRect.x) / 100;
      const cropY = (img.height * cropRect.y) / 100;

      processCanvas.width = cropWidth + padding * 2;
      processCanvas.height = cropHeight + padding * 2;

      // Apply transparency threshold
      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        padding,
        padding,
        cropWidth,
        cropHeight
      );

      const imageData = ctx.getImageData(0, 0, processCanvas.width, processCanvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < transparencyThreshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Add outline if enabled
      if (outline) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, processCanvas.width - 2, processCanvas.height - 2);
      }

      // Download processed image
      const link = document.createElement('a');
      link.download = 'processed-asset.png';
      link.href = processCanvas.toDataURL('image/png');
      link.click();

      alert('Image processed and downloaded!');
    };
    img.src = uploadedImage;
  };

  return (
    <div className="ai-preview-panel">
      <div className="ai-controls">
        <h3>AI Preview Panel</h3>
        <p className="subtitle">Workflow support - metadata only (no AI generation)</p>
        
        <div className="control-group">
          <label>
            Prompt (Metadata)
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the asset..."
            />
          </label>
        </div>

        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded" />
          ) : (
            <div className="drop-placeholder">
              <p>Drop image here or</p>
              <label className="upload-btn">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
          )}
        </div>

        <div className="control-group">
          <label>
            Transparency Threshold
            <input
              type="range"
              min="0"
              max="255"
              value={transparencyThreshold}
              onChange={(e) => setTransparencyThreshold(Number(e.target.value))}
            />
            <span>{transparencyThreshold}</span>
          </label>
        </div>

        <div className="control-row">
          <label>
            Anchor X
            <input
              type="number"
              step="0.1"
              value={anchorX}
              onChange={(e) => setAnchorX(Number(e.target.value))}
            />
          </label>
          <label>
            Anchor Y
            <input
              type="number"
              step="0.1"
              value={anchorY}
              onChange={(e) => setAnchorY(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={billboardMode}
              onChange={(e) => setBillboardMode(e.target.checked)}
            />
            Billboard
          </label>
          <label>
            <input
              type="checkbox"
              checked={spriteMode}
              onChange={(e) => setSpriteMode(e.target.checked)}
            />
            Sprite Mode
          </label>
        </div>

        <div className="control-group">
          <label>
            Scale
            <input
              type="number"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Padding
            <input
              type="number"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="control-row">
          <label>
            <input
              type="checkbox"
              checked={outline}
              onChange={(e) => setOutline(e.target.checked)}
            />
            Outline
          </label>
          <label>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Grid
          </label>
          <label>
            <input
              type="checkbox"
              checked={turntable}
              onChange={(e) => setTurntable(e.target.checked)}
            />
            Turntable
          </label>
        </div>

        <div className="control-group">
          <label>
            Background Color
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </label>
        </div>

        <button className="process-btn" onClick={processAndSave}>
          Process & Save PNG
        </button>
      </div>

      <div className="preview-viewport">
        <h4>Live Preview (Game Camera)</h4>
        <canvas ref={canvasRef} className="preview-canvas" />
      </div>
    </div>
  );
};
