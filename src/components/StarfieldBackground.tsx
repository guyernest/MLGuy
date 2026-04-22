'use client';

import { useEffect, useRef } from 'react';

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const STAR_COUNT = 800;
    const MAX_DEPTH = 1000;
    
    // Mouse interaction for perspective shift
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 3000,
      z: Math.random() * MAX_DEPTH,
      pz: 0,
    }));

    let animationFrameId: number;

    const render = () => {
      // Clear canvas fully to be transparent so the body gradient shows through
      ctx.clearRect(0, 0, width, height);

      // Smoothly move the vanishing point towards the mouse
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const speed = 3;

      ctx.lineCap = 'round';

      stars.forEach(star => {
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 3000;
          star.y = (Math.random() - 0.5) * 3000;
          star.z = MAX_DEPTH;
          star.pz = MAX_DEPTH;
        }

        // Project 3D to 2D
        const px = (star.x / star.z) * 100 + mouseX;
        const py = (star.y / star.z) * 100 + mouseY;
        
        const ppx = (star.x / star.pz) * 100 + mouseX;
        const ppy = (star.y / star.pz) * 100 + mouseY;

        // Skip if outside bounds
        if (px < 0 || px > width || py < 0 || py > height) return;

        const opacity = Math.max(0, 1 - star.z / MAX_DEPTH);
        const size = Math.max(0.5, (1 - star.z / MAX_DEPTH) * 2.5);

        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(153, 204, 255, ${opacity})`; // lcars-blue tint
        ctx.lineWidth = size;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-80"
    />
  );
}
