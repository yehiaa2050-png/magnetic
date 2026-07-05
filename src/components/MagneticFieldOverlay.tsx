import React, { useEffect, useRef } from 'react';

interface MagneticFieldOverlayProps {
  distanceMm: number;
  forceN: number;
  themeColor: string;
}

export default function MagneticFieldOverlay({ distanceMm, forceN, themeColor }: MagneticFieldOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
         canvas.width = parent.clientWidth;
         canvas.height = parent.clientHeight;
      }
    };
    
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      
      // Simulate the 3D space positions
      // Start is the base magnet, End is the levitating object
      // When distance is larger, gap is larger
      const gap = Math.min(height / 2, Math.max(50, distanceMm * 2));
      const startY = height / 2 + gap / 2; 
      const endY = height / 2 - gap / 2; 
      
      // Density logic: higher force = more lines. Closer distance = denser opacity.
      // Maximum ~50 lines, minimum ~10.
      const baseLines = 10;
      const maxAdditionalLines = 40;
      const forceRatio = Math.min(1, forceN / 15000); // Normalize force (up to 15000N)
      const numLines = Math.floor(baseLines + forceRatio * maxAdditionalLines);
      
      // Intensity: denser visual opacity when objects are closer and force is higher
      const maxDist = 150;
      const distRatio = Math.max(0, 1 - (distanceMm / maxDist));
      const intensity = Math.max(0.15, (distRatio * 0.5) + (forceRatio * 0.5));
      
      ctx.lineWidth = 1.5;
      
      for (let i = 0; i < numLines; i++) {
        // Symmetrically distribute on left and right
        const sign = i % 2 === 0 ? 1 : -1;
        // Calculate how far the curve bulges out
        const spreadFactor = (Math.floor(i / 2) + 1) / (numLines / 2);
        const spread = spreadFactor * (width * 0.4); // bulge out up to 40% of screen width
        
        ctx.beginPath();
        const startX = centerX + (sign * spread * 0.05); // slightly wider at base
        const endX = centerX + (sign * spread * 0.05);   // slightly wider at target
        
        ctx.moveTo(startX, startY);
        
        // Control points for a smooth magnetic dipole curve
        const cp1x = centerX + (sign * spread);
        const cp1y = startY + gap * 0.5;
        const cp2x = centerX + (sign * spread);
        const cp2y = endY - gap * 0.5;
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        
        // Calculate flowing energy animation
        // We use sine wave moving along the line
        const flowOffset = (time * 3 - spreadFactor * 10);
        const pulse = (Math.sin(flowOffset) + 1) / 2; 
        
        ctx.strokeStyle = themeColor;
        ctx.globalAlpha = intensity * 0.8 * pulse;
        
        ctx.stroke();
      }

      time += 0.015; // Animation speed
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [distanceMm, forceN, themeColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-10 mix-blend-screen transition-opacity duration-300"
      style={{ opacity: 0.85 }}
    />
  );
}
