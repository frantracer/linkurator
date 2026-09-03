import React from "react";

type TagsRowProps = {
  children: React.ReactNode;
};

const TagsRow = ({children}: TagsRowProps) => {
  return (
    <div className="shrink-0 flex flex-row flex-nowrap gap-2 p-2 overflow-x-auto scrollbar-hide border-b-[1px] border-neutral">
      {children}
    </div>
  );
};

export default TagsRow;
