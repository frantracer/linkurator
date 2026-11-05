import React from "react";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {AddIcon, CheckIcon} from "../atoms/Icons";
import {paths} from "../../configuration";

type FollowToggleButtonProps = {
  followed: boolean;
  isLoggedIn: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  iconOnlyOnMobile?: boolean;
}

const FollowToggleButton = (
  {followed, isLoggedIn, onFollow, onUnfollow, iconOnlyOnMobile = false}: FollowToggleButtonProps
) => {
  const t = useTranslations("common");
  const labelClass = iconOnlyOnMobile ? "hidden sm:inline" : undefined;

  if (!isLoggedIn) {
    return (
      <Button href={paths.LOGIN} tooltip={t("follow")}>
        <AddIcon/>
        <span className={labelClass}>{t("follow")}</span>
      </Button>
    );
  }

  if (followed) {
    return (
      <Button primary={false} ariaPressed={true} clickAction={onUnfollow} tooltip={t("unfollow")}
              ariaLabel={t("following")}>
        <CheckIcon/>
        <span className={labelClass}>{t("following")}</span>
      </Button>
    );
  }

  return (
    <Button ariaPressed={false} clickAction={onFollow} tooltip={t("follow")} ariaLabel={t("follow")}>
      <AddIcon/>
      <span className={labelClass}>{t("follow")}</span>
    </Button>
  );
}

export default FollowToggleButton;
