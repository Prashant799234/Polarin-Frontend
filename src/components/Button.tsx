import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const base =
  'inline-flex h-10 items-center justify-center gap-1 rounded-xl px-4 text-sm font-bold whitespace-nowrap transition-transform active:translate-y-px';

const variants: Record<Variant, string> = {
  primary: 'bg-primary-5 text-white shadow-[0px_2px_0px_#175A6C] border border-primary-5',
  secondary: 'bg-white text-secondary-7 border border-secondary-4 shadow-btn-sec',
  danger: 'h-12 bg-red-4 text-secondary-1 border border-red-4 shadow-btn-danger',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

export default function Button({ variant = 'secondary', icon, children, className = '', ...rest }: Props) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}
