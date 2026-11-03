type NumberInputProps = {
  placeholder?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  id?: string;
}

const NumberInput = (
  {
    placeholder = "",
    value = undefined,
    onChange = () => {
    },
    id = undefined,
  }: NumberInputProps
) => {
  const handleOnChange = (value: number | undefined) => {
    onChange(value);
  }

  return (
    <input type="number"
           id={id}
           min={0}
           placeholder={placeholder}
           className="input input-sm border border-neutral focus:border-primary bg-base-100 w-full"
           value={value ?? ""}
           onChange={(event) => {
             const parsed = parseInt(event.target.value);
             handleOnChange(isNaN(parsed) ? undefined : parsed);
           }}/>
  );
}

export default NumberInput;
