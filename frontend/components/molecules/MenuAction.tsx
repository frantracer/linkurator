import React from "react";
import {MenuItem} from "../atoms/MenuItem";

type MenuActionProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  mobileOnly?: boolean;
}

const MenuAction = ({icon, label, onClick, mobileOnly = false}: MenuActionProps) => {
  const item = (
    <MenuItem onClick={onClick} hideMenuOnClick={true}>
      <div className="flex flex-row gap-2 items-center justify-left">
        {icon}
        {label}
      </div>
    </MenuItem>
  );

  return mobileOnly ? <div className="sm:hidden">{item}</div> : item;
}

export default MenuAction;
