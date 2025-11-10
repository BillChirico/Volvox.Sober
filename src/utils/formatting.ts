/**
 * Formatting Utilities
 * Common formatting functions
 * Feature: 002-app-screens
 */

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format phone number (US format)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};

/**
 * Format number with commas (e.g., 1000 => "1,000")
 */
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Pluralize word based on count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return singular;
  return plural || `${singular}s`;
};

/**
 * Format count with word (e.g., "5 messages", "1 message")
 */
export const formatCountWithWord = (count: number, singular: string, plural?: string): string => {
  return `${count} ${pluralize(count, singular, plural)}`;
};

/**
 * Format initials from name
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format location string
 */
export const formatLocation = (city?: string, state?: string, country?: string): string => {
  const parts = [city, state, country].filter(Boolean);
  return parts.join(', ');
};

/**
 * Sanitize and format user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Format file size (bytes to human readable)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format time duration (seconds to human readable)
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
};

/**
 * Format role display text
 */
export const formatRole = (role: 'sponsor' | 'sponsee' | 'both'): string => {
  const roleMap = {
    sponsor: 'Sponsor',
    sponsee: 'Sponsee',
    both: 'Both (Sponsor & Sponsee)',
  };
  return roleMap[role];
};

/**
 * Format connection status
 */
export const formatConnectionStatus = (status: 'pending' | 'active' | 'ended'): string => {
  const statusMap = {
    pending: 'Pending',
    active: 'Active',
    ended: 'Ended',
  };
  return statusMap[status];
};

/**
 * Format match status
 */
export const formatMatchStatus = (
  status: 'suggested' | 'requested' | 'declined' | 'connected',
): string => {
  const statusMap = {
    suggested: 'Suggested',
    requested: 'Requested',
    declined: 'Declined',
    connected: 'Connected',
  };
  return statusMap[status];
};

/**
 * Format message status
 */
export const formatMessageStatus = (status: 'sending' | 'sent' | 'delivered' | 'read'): string => {
  const statusMap = {
    sending: 'Sending...',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
  };
  return statusMap[status];
};

/**
 * Mask sensitive information (e.g., email)
 */
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const visibleChars = Math.min(3, Math.floor(localPart.length / 2));
  const masked = localPart.substring(0, visibleChars) + '***';

  return `${masked}@${domain}`;
};

/**
 * Generate avatar color from string (deterministic)
 */
export const getAvatarColor = (str: string): string => {
  const colors = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#14B8A6', // teal
    '#F97316', // orange
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Format array to comma-separated list with "and"
 */
export const formatList = (items: string[]): string => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  return `${allButLast}, and ${items[items.length - 1]}`;
};
