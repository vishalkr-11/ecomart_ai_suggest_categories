import clsx from 'clsx';

export default function Badge({ children, variant = 'green', className = '' }) {
  return (
    <span className={clsx('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  );
}
