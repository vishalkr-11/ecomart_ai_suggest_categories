import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export const formatDate = (date) => dayjs(date).format('DD MMM YYYY, hh:mm A');
export const formatDateShort = (date) => dayjs(date).format('DD MMM YYYY');
export const fromNow = (date) => dayjs(date).fromNow();

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-IN').format(n ?? 0);

export const formatTokens = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export const formatLatency = (ms) => {
  if (!ms) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
};

export const pct = (part, total) =>
  total === 0 ? 0 : Math.min(100, Math.round((part / total) * 100));

export const slugToLabel = (s) =>
  s ? s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str;
