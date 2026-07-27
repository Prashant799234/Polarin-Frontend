import type { Severity } from '../types';

const styles: Record<Severity, string> = {
  Critical: 'bg-red-2 border-red-3 text-red-5',
  Info: 'bg-blue-2 border-blue-3 text-blue-5',
};

export default function SeverityBadge({ severity, className = '' }: { severity: Severity; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-3xl border px-2 py-1 text-[10px] font-lato ${styles[severity]} ${className}`}
    >
      {severity}
    </span>
  );
}
