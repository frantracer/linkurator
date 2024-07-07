import { useState, useEffect } from "react";

type InputTextProps = {
  placeholder?: string;
  withLeftPadding?: boolean;
  onChange?: (value: string) => void;
  value?: string;
};

const InputText = (
  {
    placeholder = "Input",
    withLeftPadding = false,
    onChange = undefined,
    value = ""
  }: InputTextProps) => {
  const [searchValue, setSearchValue] = useState(value);

  let padding = "";
  if (withLeftPadding) {
    padding = "pl-10";
  }

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  return (
    <input
      className={"input input-sm input-bordered input-primary bg-base-200 w-full " + padding}
      type="text"
      placeholder={placeholder}
      value={searchValue}
      onChange={(e) => {
        setSearchValue(e.target.value);
        if (onChange) {
          onChange(e.target.value);
        }
      }}
    />
  );
}

export default InputText;
