import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Button component
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading  - shows spinner, disables click
 * @param {boolean} fullWidth
 * @param {ReactNode} leftIcon
 * @param {ReactNode} rightIcon
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading  ? 'btn--loading' : '',
        className,
      ].join(' ').trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn__spinner animate-spin" size={16} />
      ) : leftIcon ? (
        <span className="btn__icon btn__icon--left">{leftIcon}</span>
      ) : null}

      {children && <span className="btn__label">{children}</span>}

      {!loading && rightIcon && (
        <span className="btn__icon btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
}
