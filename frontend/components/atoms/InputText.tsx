import {useState} from "react";

type InputTextProps = {
  placeholder?: string;
  withLeftPadding?: boolean;
  onChange?: (value: string) => void;
};

const InputText = (
  {
    placeholder = "Input",
    withLeftPadding = false,
    onChange = undefined
  }: InputTextProps) => {
  const [searchValue, setSearchValue] = useState("");

  let padding = "";
  if (withLeftPadding) {
    padding = "pl-10";
  }

  return (
    <input
      className={"input input-bordered input-primary bg-base-200 w-full " + padding}
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
