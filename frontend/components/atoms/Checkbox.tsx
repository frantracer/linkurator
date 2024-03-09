import {useEffect, useState} from "react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox = (
  {
    checked = false,
    onChange = () => {
    }
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
           className="checkbox checkbox-primary"
           checked={isChecked}
           onChange={(event) => handleOnChange(event.target.checked)}/>
  );
}

export default Checkbox;
