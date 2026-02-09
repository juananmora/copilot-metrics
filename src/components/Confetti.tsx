import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
  opacity: number;
}

interface ConfettiConfig {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  colors?: string[];
  origin?: { x: number; y: number };
}

// Context para disparar confetti desde cualquier parte de la app
interface ConfettiContextType {
  fire: (config?: ConfettiConfig) => void;
  celebrate: () => void; // Preset para celebraciones
}

const ConfettiContext = createContext<ConfettiContextType | null>(null);

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
}

const defaultColors = [
  '#A100FF', // Accenture Purple
  '#7500C0', // Purple Dark
  '#C966FF', // Purple Light
  '#00A551', // Accenture Green
  '#FFB800', // Accenture Gold
  '#0070AD', // Info Blue
  '#E8CCFF', // Soft Purple
];

interface ConfettiProviderProps {
  children: ReactNode;
}

export function ConfettiProvider({ children }: ConfettiProviderProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const fire = useCallback((config: ConfettiConfig = {}) => {
    const {
      particleCount = 100,
      spread = 70,
      startVelocity = 45,
      colors = defaultColors,
      origin = { x: 0.5, y: 0.5 },
    } = config;

    const newPieces: ConfettiPiece[] = [];
    const spreadRad = (spread * Math.PI) / 180;

    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
      const velocity = startVelocity * (0.5 + Math.random() * 0.5);
      
      newPieces.push({
        id: Date.now() + i,
        x: origin.x * window.innerWidth,
        y: origin.y * window.innerHeight,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 6,
        velocity: {
          x: Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1),
          y: Math.sin(angle) * velocity,
        },
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
      });
    }

    setPieces(prev => [...prev, ...newPieces]);
    setIsActive(true);
  }, []);

  const celebrate = useCallback(() => {
    // Disparo múltiple para efecto de celebración
    fire({ origin: { x: 0.25, y: 0.6 }, spread: 55, particleCount: 50 });
    setTimeout(() => fire({ origin: { x: 0.75, y: 0.6 }, spread: 55, particleCount: 50 }), 100);
    setTimeout(() => fire({ origin: { x: 0.5, y: 0.4 }, spread: 100, particleCount: 80 }), 200);
  }, [fire]);

  // Animación de física
  useEffect(() => {
    if (!isActive || pieces.length === 0) return;

    const gravity = 0.5;
    const decay = 0.95;
    const terminalVelocity = 5;

    const animate = () => {
      setPieces(prev => {
        const updated = prev.map(piece => ({
          ...piece,
          x: piece.x + piece.velocity.x,
          y: piece.y + piece.velocity.y,
          velocity: {
            x: piece.velocity.x * decay,
            y: Math.min(piece.velocity.y + gravity, terminalVelocity),
          },
          rotation: piece.rotation + piece.rotationSpeed,
          opacity: piece.opacity - 0.008,
        })).filter(piece => 
          piece.opacity > 0 && 
          piece.y < window.innerHeight + 100
        );

        if (updated.length === 0) {
          setIsActive(false);
        }
        
        return updated;
      });
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [pieces, isActive]);

  return (
    <ConfettiContext.Provider value={{ fire, celebrate }}>
      {children}
      
      {/* Render confetti pieces */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {pieces.map(piece => (
            <div
              key={piece.id}
              className="absolute"
              style={{
                left: piece.x,
                top: piece.y,
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                opacity: piece.opacity,
                borderRadius: '2px',
                boxShadow: `0 0 ${piece.size / 2}px ${piece.color}40`,
              }}
            />
          ))}
        </div>
      )}
    </ConfettiContext.Provider>
  );
}

// Componente de botón para testing
export function ConfettiButton({ className = '' }: { className?: string }) {
  const { celebrate } = useConfetti();
  
  return (
    <button
      onClick={celebrate}
      className={`px-4 py-2 bg-gradient-to-r from-[#A100FF] to-[#7500C0] text-white rounded-lg
                  font-semibold hover:opacity-90 transition-opacity ${className}`}
    >
      🎉 Celebrar
    </button>
  );
}
