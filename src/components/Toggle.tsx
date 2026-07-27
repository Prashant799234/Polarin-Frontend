interface Props {
  on: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
  label?: string;
}

export default function Toggle({ on, onToggle, size = 'md', label }: Props) {
  const track = size === 'md' ? 'h-6 w-11' : 'h-5 w-9';
  const knob = size === 'md' ? 'size-5' : 'size-4';
  const travel = size === 'md' ? (on ? 'translate-x-5' : 'translate-x-0.5') : on ? 'translate-x-4' : 'translate-x-0.5';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150 active:scale-95 ${track} ${
        on ? 'bg-primary-4' : 'bg-secondary-4'
      }`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform duration-150 ${knob} ${travel}`}
      />
    </button>
  );
}
