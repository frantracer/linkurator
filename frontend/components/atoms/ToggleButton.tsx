import React from "react";

type ToggleButtonProps = {
  label: string;
  value: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleButton = (props: ToggleButtonProps) => {
  return (
    <input
      type="checkbox"
      alt={props.label}
      onChange={props.onChange}
      checked={props.value}
      className="toggle"
    />
  );
}

export default ToggleButton;
