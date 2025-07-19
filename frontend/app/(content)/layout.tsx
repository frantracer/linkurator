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
    <div className="h-screen w-screen">
      <LateralNavigationMenu>
        {children}
      </LateralNavigationMenu>
      <BottomMenuMobile />
    </div>
  )
}
