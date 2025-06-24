import InputText from "../atoms/InputText";
import {CrossIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {useEffect, useState} from "react";

type SearchBarProps = {
  placeholder: string;
  handleChange?: (value: string) => void;
  handleClick?: () => void;
  value?: string;
  autofocus?: boolean;
};

const SearchBar = (
  {
    placeholder,
    handleChange = undefined,
    handleClick = undefined,
    value = "",
    autofocus = false
  }: SearchBarProps
) => {
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
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-transparent">
        <MagnifyingGlassIcon/>
      </div>
      <InputText placeholder={placeholder} onClick={handleClick} onChange={setValue} withLeftPadding={true} value={searchValue} autofocus={autofocus}/>
      {searchValue !== "" &&
          <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 cursor-pointer bg-base-200 hover:bg-secondary rounded-full"
              onClick={() => setValue("")}>
              <CrossIcon/>
          </div>
      }
    </div>
  );
}

export default SearchBar;
