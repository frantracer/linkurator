'use client';

import {LateralNavigationMenu} from "../../components/organism/LateralNavigationMenu";
import BottomMenuMobile from "../../components/atoms/BottomMenuMobile";
import {useTranslations} from "next-intl";

export default function DashboardLayout(
  {
    children,
  }: {
    children?: React.ReactNode
  }) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col h-dvh w-dvw overflow-y-hidden">
      <a href="#main-content"
         className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] btn btn-sm btn-primary">
        {t("skip_to_content")}
      </a>
      <div className="flex flex-1 overflow-y-hidden min-h-0">
        <LateralNavigationMenu>
          <div id="main-content" tabIndex={-1} className="flex flex-col flex-1 min-h-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0 outline-none">
            {children}
          </div>
        </LateralNavigationMenu>
      </div>
      <BottomMenuMobile/>
    </div>
  )
}
