import verifiedUser from '../assets/icons/verified-user.svg';
import addIcon from '../assets/icons/add.svg';
import Button from './Button';

interface Props {
  title: string;
  description: string;
  onCreate: () => void;
}

export default function EmptyState({ title, description, onCreate }: Props) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex items-center justify-center rounded-full bg-primary-2 p-4">
        <img src={verifiedUser} alt="" className="size-10" />
      </div>
      <div className="flex max-w-[420px] flex-col items-center gap-1">
        <p className="font-lato text-base font-extrabold text-secondary-7">{title}</p>
        <p className="text-sm text-secondary-6">{description}</p>
      </div>
      <Button variant="secondary" icon={<img src={addIcon} alt="" className="size-5" />} onClick={onCreate}>
        Create Alert
      </Button>
    </div>
  );
}
