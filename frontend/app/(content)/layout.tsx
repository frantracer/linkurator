'use client';

import {LateralNavigationMenu} from "../../components/organism/LateralNavigationMenu";
import BottomMenuMobile from "../../components/atoms/BottomMenuMobile";

export default function DashboardLayout(
  {
    children,
  }: {
    children?: React.ReactNode
  }) {
  return (
    <div className="flex flex-col h-dvh w-dvw overflow-y-hidden">
      <div className="flex flex-1 overflow-y-hidden min-h-0">
        <LateralNavigationMenu>
          <div className="flex flex-col flex-1 min-h-0 pb-16 lg:pb-0">
            {children}
          </div>
        </LateralNavigationMenu>
      </div>
      <BottomMenuMobile/>
    </div>
  )
}
