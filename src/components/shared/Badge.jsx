import './Badge.css';

/**
 * Badge component
 *
 * @param {'count'|'role'|'status'} variant
 * @param {'admin'|'member'|'online'|'offline'} type  (for role/status variants)
 */
export default function Badge({ children, variant = 'count', type, className = '' }) {
  return (
    <span
      className={[
        'badge',
        `badge--${variant}`,
        type ? `badge--${type}` : '',
        className,
      ].join(' ').trim()}
    >
      {children}
    </span>
  );
}
