import React from "react";

type EmptyStateBoxProps = {
  title: string;
  message: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const EmptyStateBox = ({title, message, icon, children}: EmptyStateBoxProps) => {
  return (
    <div className="flex flex-col items-center gap-3 max-w-md mx-auto px-6 py-10 text-center">
      {icon &&
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-base-content/5 text-base-content/70">
            {icon}
          </div>
      }
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-base-content/70">{message}</p>
      {children && <div className="flex flex-row flex-wrap items-center justify-center gap-2 pt-1">{children}</div>}
    </div>
  );
}

export default EmptyStateBox;
