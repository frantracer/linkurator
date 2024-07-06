import InputText from "../atoms/InputText";
import {CrossIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {useEffect, useState} from "react";

type SearchBarProps = {
  placeholder?: string;
  handleChange?: (value: string) => void;
  value?: string;
};

const SearchBar = (
  {
    placeholder = "Buscar...",
    handleChange = undefined,
    value = ""
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
    <div className="relative flex flex-column">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5">
        <MagnifyingGlassIcon/>
      </div>
      <InputText placeholder={placeholder} onChange={setValue} withLeftPadding={true} value={searchValue}/>
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
