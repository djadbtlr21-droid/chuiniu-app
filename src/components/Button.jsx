const VARIANTS = {
  primary: 'bg-accent-red hover:bg-accent-redDark text-white border-accent-red/50',
  gold: 'bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold border-accent-gold/40',
  ghost: 'bg-transparent hover:bg-bg-elevated text-text-secondary border-text-muted/30',
  danger: 'bg-accent-redDark hover:bg-red-900 text-white border-accent-red/50',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  fullWidth = false,
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${VARIANTS[variant] || VARIANTS.primary}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg border font-bold
        transition-all duration-200
        active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  );
}
