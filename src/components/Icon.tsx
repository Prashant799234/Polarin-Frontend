interface Props {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
}

export default function Icon({ name, size = 20, className = '', filled = false }: Props) {
  return (
    <span
      className={`material-symbols-outlined shrink-0 ${className}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 20`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
