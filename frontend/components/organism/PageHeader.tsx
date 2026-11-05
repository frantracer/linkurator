import React from "react";
import useProfile from "../../hooks/useProfile";
import NotificationsDropdown from "./NotificationsDropdown";

type PageHeaderProps = {
  title: string;
  icon?: React.ReactNode;
  media?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  showNotifications?: boolean;
}

const PageHeader = ({title, icon, media, subtitle, actions, showNotifications = false}: PageHeaderProps) => {
  const {profile} = useProfile();
  const showBell = showNotifications && !!profile;

  return (
    <header className="sticky top-0 z-10 shrink-0 flex flex-row flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 min-h-14
      bg-base-100 text-base-content border-b border-neutral">
      {media && <div className="shrink-0">{media}</div>}
      <div className="flex flex-col flex-1 min-w-[9rem]">
        <h1 className="flex flex-row items-center gap-2 text-xl font-semibold leading-tight min-w-0">
          {icon && <span className="shrink-0 text-base-content/70">{icon}</span>}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <div className="text-sm text-base-content/70 truncate">{subtitle}</div>}
      </div>
      {(actions || showBell) &&
          <div className="flex flex-row flex-wrap items-center gap-2">
            {actions}
            {/* The sidebar holds the bell on desktop; on smaller screens it lives here so it is one tap away */}
            {showBell && profile &&
                <div className="lg:hidden">
                    <NotificationsDropdown profile={profile} bottom={true} position="end"/>
                </div>
            }
          </div>
      }
    </header>
  );
}

export default PageHeader;
