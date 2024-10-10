import React, {useEffect, useState} from "react";

type DropdownProps = {
  title?: string,
  options: { key: string, label: string }[],
  selected?: string,
  onChange?: (key: string) => void
}

const DISABLED_OPTION_KEY = "0";

const Select = (
  {
    title = undefined,
    options = [],
    selected = undefined,
    onChange = undefined
  }: DropdownProps) => {
  const [selectedOption, setSelectedOption] = useState<undefined | string>(selected);

  useEffect(() => {
    setSelectedOption(selected)
  }, [selected]);

  const hasDisabledTitle = title !== undefined;

  let currentSelected = selectedOption;
  if (currentSelected === undefined) {
    if (hasDisabledTitle) {
      currentSelected = DISABLED_OPTION_KEY;
    } else if (options.length > 0) {
      currentSelected = options[0].key;
    }
  }

  return (
    <select className="select select-sm select-bordered w-full border-primary"
            value={currentSelected} onChange={e => {
      setSelectedOption(e.target.value);
      if (onChange) {
        onChange(e.target.value)
      }
    }}>
      {hasDisabledTitle && <option disabled value={DISABLED_OPTION_KEY}>{title}</option>}
      {options.map(option => {
        return <option key={option.key} value={option.key}>{option.label}</option>
      })}
    </select>
  )
}

export default Select;
