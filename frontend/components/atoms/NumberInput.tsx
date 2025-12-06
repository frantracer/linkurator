type NumberInputProps = {
  placeholder?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const NumberInput = (
  {
    placeholder = "",
    value = undefined,
    onChange = () => {
    }
  }: NumberInputProps
) => {
  const handleOnChange = (value: number | undefined) => {
    onChange(value);
  }

  return (
    <input type="number"
           placeholder={placeholder}
           className="input input-sm input-primary input-bordered w-full"
           value={value ?? ""}
           onChange={(event) => {
             const parsed = parseInt(event.target.value);
             handleOnChange(isNaN(parsed) ? undefined : parsed);
           }}/>
  );
}

export default NumberInput;
