import logo from '../assets/brand/polarin-logo.png';
import userAvatar from '../assets/brand/user-avatar.png';
import notificationsIcon from '../assets/icons/notifications-unread.svg';

const NAV_ITEMS = ['Dashboard', 'Services', 'Settings', 'Help'];

export default function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b-[0.5px] border-secondary-3 bg-white px-6">
      <div className="flex flex-1 items-center py-4">
        <img src={logo} alt="Polarin" className="h-8 w-auto" />
      </div>

      <nav className="flex h-full flex-1 items-end justify-center">
        {NAV_ITEMS.map((item) => {
          const active = item === 'Settings';
          return (
            <button key={item} type="button" className="group flex flex-col items-start gap-4">
              <div className="flex items-center justify-center px-4 pb-0">
                <span
                  className={`font-lato text-sm font-bold transition-colors duration-150 ${
                    active ? 'text-primary-5' : 'text-secondary-7 group-hover:text-primary-5'
                  }`}
                >
                  {item}
                </span>
              </div>
              <div
                className={`h-0.5 w-full transition-colors duration-150 ${
                  active ? 'bg-primary-5' : 'bg-transparent group-hover:bg-primary-3'
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-8 items-center justify-center rounded-full border-[0.5px] border-secondary-2 bg-secondary-1 transition-colors duration-150 hover:bg-secondary-2 active:scale-90"
        >
          <img src={notificationsIcon} alt="" className="size-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded-full border-[0.5px] border-secondary-2">
            <img src={userAvatar} alt="" className="size-full object-cover" />
          </div>
          <div className="flex w-[87px] flex-col gap-0.5 text-xs font-bold">
            <p className="w-full text-center text-secondary-7">Abram Qureshi</p>
            <p className="w-full text-secondary-6">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
