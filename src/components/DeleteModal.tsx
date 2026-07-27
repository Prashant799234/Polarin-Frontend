import type { AlertRule } from '../types';
import ConfirmModal from './ConfirmModal';

interface Props {
  rule: AlertRule;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ rule, onClose, onConfirm }: Props) {
  return (
    <ConfirmModal
      title="Delete this alert rule?"
      confirmLabel="Delete Rule"
      warning="This action can't be undone."
      onClose={onClose}
      onConfirm={onConfirm}
      message={
        <>
          <span className="font-extrabold">{rule.ruleName} </span>
          <span className="font-normal">
            will be permanently deleted. You&apos;ll also lose all alert history for this rule, and it will stop
            watching all its services. If you only want to stop watching certain services, remove them
            individually instead.
          </span>
        </>
      }
    />
  );
}
