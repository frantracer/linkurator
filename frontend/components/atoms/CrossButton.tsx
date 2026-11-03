import React from "react";
import {useTranslations} from "next-intl";
import {CrossIcon} from "./Icons";

type CrossButtonProps = {
  onClick: () => void;
  label?: string;
}

const CrossButton = ({onClick, label = undefined}: CrossButtonProps) => {
  const t = useTranslations("common");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      className="rounded-full hover:text-primary"
      onClick={handleClick}
      aria-label={label ?? t("remove")}
      title={label ?? t("remove")}
    >
      <CrossIcon/>
    </button>
  );
};

export default CrossButton;
