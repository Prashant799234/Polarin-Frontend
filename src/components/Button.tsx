import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

const base =
  'inline-flex h-10 items-center justify-center gap-1 rounded-xl px-4 text-sm font-bold whitespace-nowrap ' +
  'transition-[background-color,border-color,box-shadow,transform,color] duration-150 ease-out ' +
  'active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-4 border border-primary-4 text-white shadow-[0px_2px_0px_#227a93] ' +
    'hover:bg-primary-5 hover:border-primary-5 hover:shadow-none ' +
    'active:bg-primary-5 active:border-primary-5 active:shadow-none ' +
    'disabled:bg-secondary-4 disabled:border-secondary-4 disabled:text-secondary-5 disabled:shadow-[0px_2px_0px_#9daec7]',
  secondary:
    'bg-white border border-secondary-4 text-secondary-7 shadow-btn-sec ' +
    'hover:bg-secondary-1 hover:shadow-none ' +
    'active:bg-secondary-1 active:shadow-none ' +
    'disabled:bg-secondary-1 disabled:text-secondary-5 disabled:border-secondary-3 disabled:shadow-none',
  danger:
    'h-12 bg-red-4 border border-red-4 text-secondary-1 shadow-btn-danger ' +
    'hover:bg-red-5 hover:border-red-5 hover:shadow-none ' +
    'active:bg-red-5 active:border-red-5 active:shadow-none ' +
    'disabled:bg-secondary-4 disabled:border-secondary-4 disabled:text-secondary-5 disabled:shadow-none',
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
