import { forwardRef } from 'react';
import './Input.css';

/**
 * Input component
 *
 * @param {string}    label
 * @param {string}    error       - Error message text
 * @param {string}    hint        - Helper text below input
 * @param {ReactNode} leftIcon
 * @param {ReactNode} rightIcon
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconClick,
    className = '',
    id,
    ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-wrap ${error ? 'input-wrap--error' : ''} ${className}`}>
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className="input-field">
        {leftIcon && (
          <span className="input-icon input-icon--left">{leftIcon}</span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            'input-el',
            leftIcon  ? 'input-el--left-icon'  : '',
            rightIcon ? 'input-el--right-icon' : '',
          ].join(' ').trim()}
          {...props}
        />

        {rightIcon && (
          <span 
            className={`input-icon input-icon--right ${onRightIconClick ? 'input-icon--clickable' : ''}`}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error && <p className="input-error">{error}</p>}
      {!error && hint && <p className="input-hint">{hint}</p>}
    </div>
  );
});

export default Input;
