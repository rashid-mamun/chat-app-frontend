import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export const formatTime = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'h:mm a'); // e.g. 10:30 AM
};

export const formatMessageDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  
  return format(date, 'MMMM d, yyyy'); // e.g. October 12, 2023
};

export const formatConversationTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  
  return format(date, 'MMM d'); // e.g. Oct 12
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
