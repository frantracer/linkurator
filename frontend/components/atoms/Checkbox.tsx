import {useEffect, useState} from "react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  small?: boolean;
}

const Checkbox = (
  {
    checked = false,
    onChange = () => {
    },
    id = undefined,
    small = false,
  }: CheckboxProps
) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleOnChange = (checked: boolean) => {
    setIsChecked(checked);
    onChange(checked);
  }

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  return (
    <input type="checkbox"
           id={id}
           className={small ? "checkbox checkbox-primary checkbox-xs" : "checkbox checkbox-primary"}
           checked={isChecked}
           onChange={(event) => handleOnChange(event.target.checked)}/>
  );
}

export default Checkbox;
