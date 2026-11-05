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
      aria-label={props.label}
      title={props.label}
      onChange={props.onChange}
      checked={props.value}
      className="toggle toggle-primary"
    />
  );
}

export default ToggleButton;
