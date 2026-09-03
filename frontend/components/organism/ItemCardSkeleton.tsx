const ItemCardSkeleton = () => {
  return (
    <div
      className="card card-compact rounded-lg w-80 bg-base-200 shadow-md border border-neutral duration-200">
      <figure className="aspect-video h-48">
        <div className="w-full h-full bg-neutral animate-pulse"/>
      </figure>
      <div className="card-body m-1">
        <div className="h-4 w-3/4 bg-neutral rounded animate-pulse"/>
        <div className="flex text-xs gap-x-2 items-center">
          <div className="h-6 w-6 bg-neutral rounded-full animate-pulse"/>
          <div className="h-6 w-6 bg-neutral rounded-full animate-pulse"/>
          <div className="h-3 w-24 bg-neutral rounded animate-pulse"/>
        </div>
        <div className="flex flex-row">
          <div className="flex flex-grow">
            <div className="h-3 w-16 bg-neutral rounded animate-pulse self-end"/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemCardSkeleton;
