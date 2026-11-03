import React from "react";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {ShareIcon} from "../atoms/Icons";
import useShareLink from "../../hooks/useShareLink";

type ShareLinkButtonProps = {
  title: string;
}

const ShareLinkButton = ({title}: ShareLinkButtonProps) => {
  const t = useTranslations("common");
  const share = useShareLink(title);

  return (
    <Button primary={false} clickAction={share} tooltip={t("share")}>
      <ShareIcon/>
      <span className="hidden sm:inline">{t("share")}</span>
    </Button>
  );
}

export default ShareLinkButton;
