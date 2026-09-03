import React from "react";

type TagProps = {
  children?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

const Tag = ({children, selected = false, onClick}: TagProps) => {
  const interactive = onClick !== undefined;
  const colorClasses = selected ? "badge-primary" : "badge-neutral badge-outline";
  return (
    <div
      className={`badge ${colorClasses} h-fit w-fit py-1 justify-start items-center text-wrap text-sm ${interactive ? "cursor-pointer" : ""}`}
      onClick={onClick}
      role={interactive ? "button" : undefined}
    >
      <div className={`flex flex-row gap-2 items-center justify-center font-semibold ${selected ? "text-primary-content" : "text-base-content"}`}>
        {children}
      </div>
    </div>
  )
}

export default Tag;
