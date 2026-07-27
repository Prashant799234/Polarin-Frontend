import { useState, type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ label, children, className = '' }: Props) {
  const [show, setShow] = useState(false);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-secondary-7 px-2.5 py-1.5 text-xs font-bold text-white shadow-card transition-opacity duration-150 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {label}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-secondary-7" />
      </span>
    </span>
  );
}
