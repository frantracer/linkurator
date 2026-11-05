import React from "react";

const SKELETON_COUNT = 6;

// Placeholder grid shaped like EntityCard, shown while topic, subscription or curator lists load
const EntityCardGridSkeleton = () => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4" aria-busy="true">
      {Array.from({length: SKELETON_COUNT}).map((_, index) => (
        <div key={index} aria-hidden="true"
             className="flex flex-col gap-3 h-28 p-4 rounded-xl border border-neutral bg-base-100">
          <div className="flex flex-row items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral animate-pulse"/>
            <div className="flex flex-col flex-1 gap-2 pt-1">
              <div className="h-3.5 w-3/4 rounded bg-neutral animate-pulse"/>
              <div className="h-3 w-1/3 rounded bg-neutral animate-pulse"/>
            </div>
          </div>
          <div className="mt-auto h-3 w-24 rounded bg-neutral animate-pulse"/>
        </div>
      ))}
    </div>
  );
}

export default EntityCardGridSkeleton;
