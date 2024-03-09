type NumberInputProps = {
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
}

const NumberInput = (
  {
    placeholder = "",
    value = 0,
    onChange = () => {
    }
  }: NumberInputProps
) => {
  const handleOnChange = (value: number) => {
    onChange(value);
  }

  return (
    <input type="number"
           placeholder={placeholder}
           className="input input-primary input-bordered w-full"
           value={value}
           onChange={(event) => handleOnChange(parseInt(event.target.value))}/>
  );
}

export default NumberInput;
