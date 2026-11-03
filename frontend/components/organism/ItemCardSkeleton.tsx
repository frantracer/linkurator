const ItemCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full" aria-hidden="true">
      <div className="w-full aspect-video rounded-xl bg-neutral animate-pulse"/>
      <div className="h-4 w-11/12 bg-neutral rounded animate-pulse"/>
      <div className="h-4 w-2/3 bg-neutral rounded animate-pulse"/>
      <div className="flex flex-row gap-2 items-center">
        <div className="h-5 w-5 bg-neutral rounded animate-pulse"/>
        <div className="h-3 w-28 bg-neutral rounded animate-pulse"/>
      </div>
    </div>
  )
}

export default ItemCardSkeleton;
