import clsx from 'clsx';

export default function Button({
  children, variant = 'primary', size = '',
  loading = false, icon, iconRight, className = '', ...props
}) {
  const cls = clsx(
    'btn',
    `btn-${variant}`,
    size && `btn-${size}`,
    loading && 'btn-loading',
    className
  );

  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="btn-spinner" />
      ) : icon ? (
        <span className="btn-icon" style={{ display:'flex',alignItems:'center' }}>{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span style={{ display:'flex',alignItems:'center' }}>{iconRight}</span>
      )}
    </button>
  );
}
