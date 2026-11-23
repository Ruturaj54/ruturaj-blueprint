import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/** As many decimals as the value itself has, up to two; thousands grouped Indian-style. */
function defaultFormat(target: number): (n: number) => string {
  const decimals = Math.min(2, (String(target).split('.')[1] ?? '').length);
  return (n) => (decimals === 0 ? Math.round(n).toLocaleString('en-IN') : n.toFixed(decimals));
}

/**
 * A number that counts to its value: from 0 on first paint, then from
 * wherever it is to each new value. Text only, so nothing reflows; instant
 * under reduced motion.
 */
export function AnimatedNumber({ value, format, duration = 0.7 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  const latest = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      latest.current = value;
      setShown(value);
      return undefined;
    }
    const controls = animate(latest.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        latest.current = v;
        setShown(v);
      },
    });
    return () => controls.stop();
  }, [value, reduce, duration]);

  return <>{(format ?? defaultFormat(value))(shown)}</>;
}
