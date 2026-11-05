import {useTranslations} from "next-intl";
import classNames from "classnames";
import {FunnelIcon} from "../atoms/Icons";

type FilterToggleButtonProps = {
  isOpen: boolean;
  isModified: boolean;
  onClick: () => void;
}

const FilterToggleButton = ({isOpen, isModified, onClick}: FilterToggleButtonProps) => {
  const t = useTranslations("common");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isOpen}
      title={t("filters")}
      className={classNames("relative btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap", {
        "btn-outline border-base-content/30 text-base-content hover:!bg-base-content/10 hover:!border-base-content/60 hover:!text-base-content": !isOpen,
        "bg-primary/15 border-primary text-primary hover:bg-primary/20 hover:border-primary": isOpen,
      })}
    >
      <FunnelIcon/>
      <span className="hidden sm:inline">{t("filters")}</span>
      {isModified &&
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-base-100"
                aria-hidden="true"/>
      }
    </button>
  );
}

export default FilterToggleButton;
