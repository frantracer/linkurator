import React, {useRef} from "react";
import useWheelScrollsHorizontally from "../../hooks/useWheelScrollsHorizontally";

type TagsRowProps = {
  leading?: React.ReactNode;
  children?: React.ReactNode;
};

// The leading slot stays pinned on the left while the tags scroll horizontally
const TagsRow = ({leading, children}: TagsRowProps) => {
  const stripRef = useRef<HTMLDivElement>(null);
  useWheelScrollsHorizontally(stripRef);

  return (
    <div className="shrink-0 flex flex-row items-center bg-base-300 border-b-[1px] border-neutral">
      {leading &&
          <div className="shrink-0 flex items-center pl-2 py-2">
            {leading}
          </div>
      }
      <div ref={stripRef} className="flex flex-row flex-nowrap items-center gap-2 p-2 overflow-x-auto scrollbar-hide min-w-0">
        {children}
      </div>
    </div>
  );
};

export default TagsRow;
