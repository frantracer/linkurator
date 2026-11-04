const ItemCardSkeleton = () => {
  return (
    <div className="flex flex-col w-full rounded-xl border border-neutral bg-base-100 overflow-hidden" aria-hidden="true">
      <div className="w-full aspect-video bg-neutral animate-pulse"/>
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-11/12 bg-neutral rounded animate-pulse"/>
        <div className="h-4 w-2/3 bg-neutral rounded animate-pulse"/>
        <div className="flex flex-row gap-2 items-center">
          <div className="h-5 w-5 bg-neutral rounded animate-pulse"/>
          <div className="h-3 w-28 bg-neutral rounded animate-pulse"/>
          <div className="ml-auto h-3 w-12 bg-neutral rounded animate-pulse"/>
        </div>
        <div className="flex flex-row gap-2 pt-1">
          <div className="h-8 flex-1 bg-neutral rounded-md animate-pulse"/>
          <div className="h-8 flex-1 bg-neutral rounded-md animate-pulse"/>
          <div className="h-8 w-9 bg-neutral rounded-md animate-pulse"/>
        </div>
      </div>
    </div>
  )
}

export default ItemCardSkeleton;
