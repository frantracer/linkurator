import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {FunnelIcon} from "../atoms/Icons";

type FilterToggleButtonProps = {
  isOpen: boolean;
  isModified: boolean;
  onClick: () => void;
}

const FilterToggleButton = ({isOpen, isModified, onClick}: FilterToggleButtonProps) => {
  const t = useTranslations("common");

  return (
    <div className="relative w-fit">
      <Button primary={isOpen} fitContent={true} clickAction={onClick} tooltip={t("filter")}>
        <FunnelIcon/>
      </Button>
      {isModified &&
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-secondary border-2 border-base-100
          pointer-events-none"/>
      }
    </div>
  );
}

export default FilterToggleButton;
