import React from "react";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {CheckIcon} from "../atoms/Icons";
import {paths} from "../../configuration";

type FollowToggleButtonProps = {
  followed: boolean;
  isLoggedIn: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

const FollowToggleButton = ({followed, isLoggedIn, onFollow, onUnfollow}: FollowToggleButtonProps) => {
  const t = useTranslations("common");

  if (!isLoggedIn) {
    return <Button href={paths.LOGIN}>{t("follow")}</Button>;
  }

  if (followed) {
    return (
      <Button primary={false} ariaPressed={true} clickAction={onUnfollow} tooltip={t("unfollow")} ariaLabel={t("following")}>
        <CheckIcon/>
        {t("following")}
      </Button>
    );
  }

  return (
    <Button ariaPressed={false} clickAction={onFollow}>
      {t("follow")}
    </Button>
  );
}

export default FollowToggleButton;
