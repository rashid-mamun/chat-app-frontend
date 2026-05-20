import './Avatar.css';

// Consistent color palette — picked by hashing username
const AVATAR_COLORS = [
  ['#0f766e', '#fff'],
  ['#0284c7', '#fff'],
  ['#16a34a', '#fff'],
  ['#d97706', '#fff'],
  ['#dc2626', '#fff'],
  ['#be123c', '#fff'],
  ['#0891b2', '#fff'],
  ['#4f46e5', '#fff'],
];

function getColorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || '?').toUpperCase();
}

/**
 * Avatar — auto-generated initials or image.
 *
 * @param {string}  name      - User's display name
 * @param {string}  imgSrc    - URL of the user's avatar image
 * @param {'sm'|'md'|'lg'|'xl'} size - Avatar size
 * @param {boolean} online    - Show green online dot
 * @param {string}  className - Extra CSS classes
 */
export default function Avatar({ name = '', imgSrc = null, size = 'md', online, className = '' }) {
  const [bg, fg] = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div className={`avatar avatar--${size} ${className}`} aria-label={name}>
      {imgSrc ? (
        <img src={imgSrc} alt={name} className="avatar__image" />
      ) : (
        <span
          className="avatar__initials"
          style={{ background: bg, color: fg }}
        >
          {initials}
        </span>
      )}
      {online !== undefined && (
        <span
          className={`avatar__status ${online ? 'avatar__status--online' : 'avatar__status--offline'}`}
        />
      )}
    </div>
  );
}
