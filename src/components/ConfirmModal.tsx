import { useEffect, useState, type ReactNode } from 'react';
import Icon from './Icon';
import Button from './Button';

interface Props {
  title: string;
  message: ReactNode;
  warning?: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({ title, message, warning, confirmLabel, onClose, onConfirm }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-opacity duration-150 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex w-[600px] max-w-[92vw] flex-col items-center rounded-3xl bg-white transition-all duration-150 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center gap-8 border-b border-secondary-2 p-6">
          <p className="flex-1 font-inter text-xl font-extrabold text-secondary-7">{title}</p>
          <Button variant="secondary" icon={<Icon name="close" size={20} />} onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-8 p-10">
          <p className="text-center text-xl leading-7 text-secondary-7">{message}</p>

          {warning && (
            <div className="flex w-full items-start rounded-2xl border border-orange-3 bg-yellow-2 px-6 py-4">
              <div className="flex flex-1 items-center gap-2">
                <Icon name="info" size={24} className="text-orange-5" filled />
                <p className="flex-1 text-sm font-extrabold text-secondary-7">{warning}</p>
              </div>
            </div>
          )}

          <Button
            variant="danger"
            onClick={() => {
              setVisible(false);
              window.setTimeout(onConfirm, 150);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
