'use client';

import React from "react";
import {useTranslations} from "next-intl";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import Dropdown from "../atoms/Dropdown";
import {paths} from "../../configuration";

type GuestAvatarDropdownProps = {
  bottom?: boolean;
  position?: "start" | "center" | "end";
};

const GuestAvatarDropdown = ({bottom = true, position = "end"}: GuestAvatarDropdownProps) => {
  const t = useTranslations("common");

  return (
    <Dropdown
      button={
        <div
          className="w-fit h-fit border-transparent hover:border-primary border-2 rounded-full overflow-hidden p-0">
          <Avatar src="" alt=""/>
        </div>
      }
      bottom={bottom}
      position={position}
      closeOnClickInside={true}
    >
      <div className="flex flex-col gap-3 p-4">
        <Button href={paths.REGISTER} fitContent={false} primary={true}>
          {t("sign_up")}
        </Button>
        <Button href={paths.LOGIN} fitContent={false} primary={false}>
          {t("log_in")}
        </Button>
      </div>
    </Dropdown>
  );
};

export default GuestAvatarDropdown;
