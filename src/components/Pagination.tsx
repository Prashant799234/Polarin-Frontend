import chevronBackward from '../assets/icons/chevron-backward.svg';
import chevronForward from '../assets/icons/chevron-forward.svg';
import keyboardArrowDown from '../assets/icons/keyboard-arrow-down.svg';

interface Props {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, pageSize, onPageChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex w-full flex-col items-end justify-center p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start justify-center overflow-hidden pr-2">
            <p className="whitespace-nowrap text-sm font-bold text-secondary-7">Total {total} Items</p>
          </div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`flex items-center justify-center overflow-hidden rounded-lg border p-2 transition-all duration-150 active:scale-90 ${
              page <= 1
                ? 'border-secondary-4 bg-secondary-4'
                : 'border-secondary-3 bg-white hover:border-primary-4 hover:bg-secondary-1'
            }`}
          >
            <img src={chevronBackward} alt="Previous" className="size-4" />
          </button>
          <div className="flex flex-col items-center overflow-hidden rounded-lg border border-primary-4 bg-white px-[7px] py-px">
            <span className="flex h-[30px] w-[18px] items-center justify-center text-sm font-medium text-primary-4">
              {page}
            </span>
          </div>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className={`flex items-center justify-center overflow-hidden rounded-lg border p-2 transition-all duration-150 active:scale-90 ${
              page >= pageCount
                ? 'border-secondary-4 bg-secondary-4'
                : 'border-secondary-3 bg-white hover:border-primary-4 hover:bg-secondary-1'
            }`}
          >
            <img src={chevronForward} alt="Next" className="size-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-secondary-3 bg-white px-3 py-1 transition-colors duration-150 hover:border-secondary-4 hover:bg-secondary-1"
          >
            <span className="text-sm text-[#324158]">{pageSize} / page</span>
            <img src={keyboardArrowDown} alt="" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
