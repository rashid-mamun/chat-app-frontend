import { formatMessageDate } from '../../utils/formatters';
import './DateSeparator.css';

export default function DateSeparator({ date }) {
  if (!date) return null;
  
  return (
    <div className="date-sep my-4 flex items-center justify-center">
      <div className="date-sep__line flex-1"></div>
      <span className="date-sep__text mx-4 text-xs font-medium text-muted bg-elevated px-3 py-1 rounded-full shadow-sm">
        {formatMessageDate(date)}
      </span>
      <div className="date-sep__line flex-1"></div>
    </div>
  );
}
