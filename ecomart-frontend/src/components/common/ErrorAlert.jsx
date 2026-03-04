import { AlertCircle } from 'lucide-react';

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="alert alert-error animate-fade-in">
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{message}</span>
    </div>
  );
}
