import InputText from "../atoms/InputText";
import {CrossIcon, FunnelIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

export type SearchBarIcon = "search" | "filter";

type SearchBarProps = {
  placeholder: string;
  handleChange?: (value: string) => void;
  handleClick?: () => void;
  value?: string;
  autofocus?: boolean;
  icon?: SearchBarIcon;
};

const SearchBar = (
  {
    placeholder,
    handleChange = undefined,
    handleClick = undefined,
    value = "",
    autofocus = false,
    icon = "search"
  }: SearchBarProps
) => {
  const t = useTranslations("common");
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const setValue = (value: string) => {
    setSearchValue(value);
    if (handleChange) {
      handleChange(value);
    }
  }

  return (
    <div className="relative flex flex-column w-full">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-transparent pointer-events-none">
        {icon === "filter" ? <FunnelIcon/> : <MagnifyingGlassIcon/>}
      </div>
      <InputText placeholder={placeholder} ariaLabel={placeholder} onClick={handleClick} onChange={setValue} withLeftPadding={true} value={searchValue} autofocus={autofocus}/>
      {searchValue !== "" &&
          <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-base-200 hover:text-primary rounded-full"
              aria-label={t("clear_search")}
              title={t("clear_search")}
              onClick={() => setValue("")}>
              <CrossIcon/>
          </button>
      }
    </div>
  );
}

export default SearchBar;
