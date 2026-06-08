import React, { useRef, useState } from 'react';
import { X, Check, RefreshCw, Pen } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClose: () => void;
  title?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose, title = 'Sign Here' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="signature-modal-overlay">
      <div className="signature-modal">
        <div className="signature-header">
          <h3>
            <Pen size={18} />
            {title}
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="signature-body">
          <div className="signature-instructions">
            <p>Draw your signature in the box below</p>
            <p className="instruction-note">Use your mouse or touch to sign</p>
          </div>
          
          <div className="signature-canvas-container">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              className="signature-canvas"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="signature-line"></div>
          </div>
          
          <div className="signature-actions">
            <button className="btn-clear" onClick={clearSignature}>
              <RefreshCw size={14} />
              Clear
            </button>
            <button 
              className="btn-save" 
              onClick={saveSignature}
              disabled={!hasSignature}
            >
              <Check size={14} />
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
