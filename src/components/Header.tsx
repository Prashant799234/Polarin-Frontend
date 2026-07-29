import { useState } from 'react';
import type { AlertRule } from '../types';
import type { ToastTone } from '../hooks/useToasts';
import logo from '../assets/brand/polarin-logo.png';
import userAvatar from '../assets/brand/user-avatar.png';
import Icon from './Icon';
import NotificationCenter from './NotificationCenter';
import { alertNotificationItems } from '../utils/rules';

const NAV_ITEMS = ['Dashboard', 'Services', 'Settings', 'Help'];

interface Props {
  alerts: AlertRule[];
  onViewAlert: (rule: AlertRule) => void;
  onToast: (message: string, tone?: ToastTone) => void;
}

export default function Header({ alerts, onViewAlert, onToast }: Props) {
  const [showNotifications, setShowNotifications] = useState(false);
  // Lives here, not inside NotificationCenter, so read state survives closing and reopening the panel.
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const { active } = alertNotificationItems(alerts);

  const markRead = (ids: string[]) => {
    setReadIds((prev) => new Set([...prev, ...ids]));
  };

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
          onClick={() => setShowNotifications(true)}
          className="relative flex size-8 items-center justify-center rounded-full border-[0.5px] border-secondary-2 bg-secondary-1 transition-colors duration-150 hover:bg-secondary-2 active:scale-90"
        >
          <Icon name="notifications" size={20} className="text-secondary-7" />
          {active.length > 0 && (
            <span className="absolute right-1 top-1 size-2 rounded-full border border-white bg-red-4" />
          )}
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

      {showNotifications && (
        <NotificationCenter
          alerts={alerts}
          onViewAlert={onViewAlert}
          onToast={onToast}
          onClose={() => setShowNotifications(false)}
          readIds={readIds}
          onMarkRead={markRead}
        />
      )}
    </header>
  );
}
