import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface ParticleBackgroundProps {
  /** Número de partículas */
  particleCount?: number;
  /** Colores de las partículas */
  colors?: string[];
  /** Velocidad de movimiento */
  speed?: number;
  /** Mostrar líneas de conexión entre partículas cercanas */
  connectParticles?: boolean;
  /** Distancia máxima para conectar partículas */
  connectDistance?: number;
  /** Responder al mouse */
  interactive?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export function ParticleBackground({
  particleCount = 50,
  colors = ['#A100FF', '#C966FF', '#7500C0', '#00A551'],
  speed = 0.5,
  connectParticles = true,
  connectDistance = 150,
  interactive = true,
  className = '',
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Inicializar partículas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      setDimensions({ width: rect.width, height: rect.height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Crear partículas cuando las dimensiones cambian
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));
  }, [dimensions, particleCount, colors, speed]);

  // Manejar movimiento del mouse
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive]);

  // Animación
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Actualizar y dibujar partículas
      particles.forEach((particle, i) => {
        // Actualizar posición
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce en los bordes
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(dimensions.width, particle.x));
        }
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(dimensions.height, particle.y));
        }

        // Interacción con el mouse
        if (interactive) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx -= (dx / distance) * force * 0.1;
            particle.vy -= (dy / distance) * force * 0.1;
          }
        }

        // Limitar velocidad
        const maxSpeed = speed * 2;
        const currentSpeed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
        if (currentSpeed > maxSpeed) {
          particle.vx = (particle.vx / currentSpeed) * maxSpeed;
          particle.vy = (particle.vy / currentSpeed) * maxSpeed;
        }

        // Actualizar pulso
        particle.pulse += particle.pulseSpeed;
        const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.2;

        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(
          particle.x * dpr,
          particle.y * dpr,
          particle.size * dpr,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, pulseOpacity));
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(
          particle.x * dpr,
          particle.y * dpr,
          particle.size * 2 * dpr,
          0,
          Math.PI * 2
        );
        const gradient = ctx.createRadialGradient(
          particle.x * dpr,
          particle.y * dpr,
          0,
          particle.x * dpr,
          particle.y * dpr,
          particle.size * 2 * dpr
        );
        gradient.addColorStop(0, `${particle.color}40`);
        gradient.addColorStop(1, `${particle.color}00`);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = pulseOpacity * 0.5;
        ctx.fill();

        // Conectar partículas cercanas
        if (connectParticles) {
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectDistance) {
              ctx.beginPath();
              ctx.moveTo(particle.x * dpr, particle.y * dpr);
              ctx.lineTo(other.x * dpr, other.y * dpr);
              
              const lineOpacity = (1 - distance / connectDistance) * 0.2;
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha = lineOpacity;
              ctx.lineWidth = 1 * dpr;
              ctx.stroke();
            }
          }
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, connectParticles, connectDistance, interactive, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Versión simplificada para usar como fondo de sección
export function ParticleSection({ 
  children, 
  className = '',
  particleProps = {} 
}: { 
  children: React.ReactNode;
  className?: string;
  particleProps?: Partial<ParticleBackgroundProps>;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ParticleBackground 
        particleCount={30}
        connectParticles={false}
        speed={0.3}
        {...particleProps}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
