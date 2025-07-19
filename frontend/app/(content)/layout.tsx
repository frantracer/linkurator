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
      <div className="flex flex-grow overflow-y-hidden">
        <LateralNavigationMenu>
          {children}
        </LateralNavigationMenu>
      </div>
      <div className="flex flex-none">
        <BottomMenuMobile/>
      </div>
    </div>
  )
}
