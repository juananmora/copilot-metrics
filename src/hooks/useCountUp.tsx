import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

export function useCountUp({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  suffix = '',
  prefix = '',
  easing = 'easeOut'
}: UseCountUpOptions) {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const easingFunctions = {
      linear: (t: number) => t,
      easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
      easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](progress);
      
      const currentValue = start + (end - start) * easedProgress;
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setIsComplete(true);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, easing]);

  const formattedValue = `${prefix}${count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${suffix}`;

  return { count, formattedValue, isComplete };
}

// Componente wrapper para usar fácilmente
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({ 
  value, 
  duration = 2000, 
  decimals = 0,
  suffix = '',
  prefix = '',
  className = ''
}: AnimatedNumberProps) {
  const { formattedValue } = useCountUp({
    end: value,
    duration,
    decimals,
    suffix,
    prefix
  });

  return <span className={className}>{formattedValue}</span>;
}
