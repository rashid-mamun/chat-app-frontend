import { Moon, Sun } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();
  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
    >
      <div className="theme-toggle__icon-wrapper">
        <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={18} />
        <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={18} />
      </div>
    </button>
  );
}
