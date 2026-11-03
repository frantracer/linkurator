import React from "react";
import classNames from "classnames";

type SettingsSectionProps = {
  title: string;
  description?: string;
  danger?: boolean;
  children: React.ReactNode;
}

const SettingsSection = ({title, description, danger = false, children}: SettingsSectionProps) => {
  return (
    <section className={classNames("flex flex-col gap-4 p-5 rounded-2xl border bg-base-100", {
      "border-neutral": !danger,
      "border-error/50": danger,
    })}>
      <div className="flex flex-col gap-1">
        <h2 className={classNames("text-base font-semibold", {"text-error": danger})}>{title}</h2>
        {description && <p className="text-sm text-base-content/70">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default SettingsSection;
