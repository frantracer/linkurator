import React, {useId, useState} from "react";
import {useTranslations} from "next-intl";
import InputText, {InputType} from "../atoms/InputText";

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputType?: InputType;
  autoComplete?: string;
  name?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autofocus?: boolean;
}

const FormField = (
  {
    label,
    value,
    onChange,
    placeholder = "",
    inputType = InputType.TEXT,
    autoComplete = undefined,
    name = undefined,
    hint = undefined,
    error = undefined,
    required = false,
    disabled = false,
    autofocus = false,
  }: FormFieldProps
) => {
  const t = useTranslations("common");
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = inputType === InputType.PASSWORD;
  const describedBy = [hint ? id + "-hint" : "", error ? id + "-error" : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-row items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {isPassword &&
            <button type="button" className="text-xs link link-hover text-base-content/70"
                    aria-controls={id} aria-pressed={revealed} onClick={() => setRevealed(!revealed)}>
              {revealed ? t("hide_password") : t("show_password")}
            </button>
        }
      </div>
      <InputText
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputType={isPassword && revealed ? InputType.TEXT : inputType}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        autofocus={autofocus}
        describedBy={describedBy}
        invalid={error !== undefined}
      />
      {hint && !error && <p id={id + "-hint"} className="text-xs text-base-content/60">{hint}</p>}
      {error && <p id={id + "-error"} className="text-xs text-error">{error}</p>}
    </div>
  );
}

export default FormField;
