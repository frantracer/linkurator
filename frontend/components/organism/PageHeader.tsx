import React from "react";
import classNames from "classnames";
import useProfile from "../../hooks/useProfile";
import NotificationsDropdown from "./NotificationsDropdown";

type PageHeaderProps = {
  title: string;
  icon?: React.ReactNode;
  media?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  showNotifications?: boolean;
  reserveScrollbarSpace?: boolean;
}

const PageHeader = (
  {title, icon, media, subtitle, actions, showNotifications = false, reserveScrollbarSpace = false}: PageHeaderProps
) => {
  const {profile} = useProfile();
  const showBell = showNotifications && !!profile;

  return (
    <header className={classNames(`sticky top-0 z-10 shrink-0 flex flex-row items-center gap-3 px-4 h-16
      bg-base-100 text-base-content border-b border-neutral`, {
      // Keeps the actions in line with a scrolling list below, while the background still reaches the edge
      "overflow-hidden [scrollbar-gutter:stable]": reserveScrollbarSpace,
    })}>
      {media && <div className="shrink-0">{media}</div>}
      <div className="flex flex-col flex-1 min-w-0">
        <h1 className="flex flex-row items-center gap-2 text-xl font-semibold leading-tight min-w-0">
          {icon && <span className="shrink-0 text-base-content/70">{icon}</span>}
          <span className="truncate">{title}</span>
        </h1>
        {subtitle && <div className="text-sm text-base-content/70 truncate">{subtitle}</div>}
      </div>
      {(actions || showBell) &&
          <div className="flex flex-row shrink-0 items-center gap-2">
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
