import React from "react";

type TagsRowProps = {
  leading?: React.ReactNode;
  children?: React.ReactNode;
};

// The leading slot stays pinned on the left while the tags scroll horizontally
const TagsRow = ({leading, children}: TagsRowProps) => {
  return (
    <div className="shrink-0 flex flex-row items-center border-b-[1px] border-neutral">
      {leading &&
          <div className="shrink-0 flex items-center pl-2 pr-2 py-2 border-r border-neutral">
            {leading}
          </div>
      }
      <div className="flex flex-row flex-nowrap items-center gap-2 p-2 overflow-x-auto scrollbar-hide min-w-0">
        {children}
      </div>
    </div>
  );
};

export default TagsRow;
