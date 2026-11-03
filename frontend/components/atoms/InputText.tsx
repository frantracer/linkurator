import { useState, useEffect } from "react";

export enum InputType {
  TEXT = "text",
  PASSWORD = "password",
  EMAIL = "email"
}

type InputTextProps = {
  placeholder?: string;
  withLeftPadding?: boolean;
  onChange?: (value: string) => void;
  onClick?: () => void;
  value?: string;
  disabled?: boolean;
  inputType?: InputType;
  autofocus?: boolean;
  id?: string;
  name?: string;
  ariaLabel?: string;
  autoComplete?: string;
  required?: boolean;
  describedBy?: string;
  invalid?: boolean;
};

const InputText = (
  {
    placeholder = "Input",
    withLeftPadding = false,
    onChange = undefined,
    onClick = undefined,
    value = "",
    disabled = false,
    inputType = InputType.TEXT,
    autofocus = false,
    id = undefined,
    name = undefined,
    ariaLabel = undefined,
    autoComplete = undefined,
    required = false,
    describedBy = undefined,
    invalid = false,
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
      className={"input input-sm border border-neutral focus:border-primary bg-base-100 w-full " + padding + (invalid ? " input-error" : "")}
      type={inputType?.toString()}
      id={id}
      name={name}
      aria-label={ariaLabel}
      autoComplete={autoComplete}
      required={required}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      placeholder={placeholder}
      value={searchValue}
      disabled={disabled}
      // Focused by openModal when its modal opens
      // data- prefix: a custom marker React renders as-is, unlike autoFocus
      data-autofocus={autofocus || undefined}
      onChange={(e) => {
        setSearchValue(e.target.value);
        if (onChange) {
          onChange(e.target.value);
        }
      }}
      onClick={onClick}
    />
  );
}

export default InputText;
