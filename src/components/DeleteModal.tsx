import type { AlertRule } from '../types';
import closeIcon from '../assets/icons/close.svg';
import infoIcon from '../assets/icons/info.svg';
import Button from './Button';

interface Props {
  rule: AlertRule;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ rule, onClose, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="flex w-[600px] max-w-[92vw] flex-col items-center rounded-3xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center gap-8 border-b border-secondary-2 p-6">
          <p className="flex-1 font-inter text-xl font-extrabold text-secondary-7">Delete this alert rule?</p>
          <Button variant="secondary" icon={<img src={closeIcon} alt="" className="size-5" />} onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex w-full flex-col items-center justify-center gap-8 p-10">
          <p className="text-center text-xl leading-7 text-secondary-7">
            <span className="font-extrabold">{rule.ruleName} </span>
            <span className="font-normal">
              will be permanently deleted. You&apos;ll also lose all alert history for this rule, and it will
              stop watching all its services. If you only want to stop watching certain services, remove them
              individually instead.
            </span>
          </p>

          <div className="flex w-full items-start rounded-2xl border border-orange-3 bg-yellow-2 px-6 py-4">
            <div className="flex flex-1 items-center gap-2">
              <img src={infoIcon} alt="" className="size-6" />
              <p className="flex-1 font-extrabold text-sm text-secondary-7">This action can&apos;t be undone.</p>
            </div>
          </div>

          <Button variant="danger" onClick={onConfirm}>
            Delete Rule
          </Button>
        </div>
      </div>
    </div>
  );
}
