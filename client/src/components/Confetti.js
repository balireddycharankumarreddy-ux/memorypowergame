import React, { useEffect, useRef, useCallback } from 'react';
import './Confetti.css';

const COLORS = [
  '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0',
  '#ff9f43', '#ee5a24', '#00d2d3', '#1dd1a1',
  '#10ac84', '#0abde3', '#48dbfb', '#c8d6e5',
  '#ff6348', '#ffa502', '#2ed573', '#1e90ff'
];

const SHAPES = ['circle', 'square', 'triangle'];

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 10;
    this.size = Math.random() * 8 + 4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: -(Math.random() * 12 + 8)
    };
    this.gravity = 0.15;
    this.friction = 0.99;
    this.opacity = 1;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.wobble = Math.random() * 10;
    this.wobbleSpeed = Math.random() * 0.1 + 0.05;
  }

  update() {
    this.velocity.x *= this.friction;
    this.velocity.y += this.gravity;
    this.x += this.velocity.x + Math.sin(this.wobble) * 0.5;
    this.y += this.velocity.y;
    this.rotation += this.rotationSpeed;
    this.wobble += this.wobbleSpeed;
    this.opacity -= 0.005;
  }

  draw(ctx) {
    if (this.opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      default:
        break;
    }
    ctx.restore();
  }
}

const Confetti = ({ active, type = 'burst', duration = 3000 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const createBurst = useCallback((count = 80) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push(new Particle(canvas));
    }
  }, []);

  const createRain = useCallback((count = 150) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let spawned = 0;
    const spawnInterval = setInterval(() => {
      if (spawned >= count) {
        clearInterval(spawnInterval);
        return;
      }
      const p = new Particle(canvas);
      p.x = Math.random() * canvas.width;
      p.y = -10;
      p.velocity.y = Math.random() * 3 + 2;
      p.velocity.x = (Math.random() - 0.5) * 2;
      particlesRef.current.push(p);
      spawned++;
    }, 20);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);

      particlesRef.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (active) {
      if (type === 'rain') {
        createRain(150);
      } else {
        createBurst(80);
      }
      animate();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, type, createBurst, createRain]);

  // Handle multiple bursts
  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="confetti-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

export default Confetti;
