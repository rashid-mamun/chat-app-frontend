import { Loader2 } from 'lucide-react';
import './Spinner.css';

/**
 * Spinner loading indicator
 * @param {'sm'|'md'|'lg'} size
 * @param {string} color - CSS color value (defaults to --accent)
 */
export default function Spinner({ size = 'md', color, className = '' }) {
  const sizePx = size === 'sm' ? 16 : size === 'lg' ? 32 : 22;

  return (
    <Loader2
      className={`spinner animate-spin ${className}`}
      size={sizePx}
      style={color ? { color } : undefined}
    />
  );
}
