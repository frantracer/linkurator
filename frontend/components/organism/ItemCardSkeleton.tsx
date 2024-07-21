const ItemCardSkeleton = () => {

  return (
    <div className="card card-compact w-80 bg-base-200 shadow-base-100 shadow-xl hover:scale-105">
      <figure className="aspect-video h-48">
        <div className="w-full h-full bg-neutral"/>
      </figure>
      <div className="card-body">
        <h2 className="card-title cursor-pointer">
          {"Cargando..."}
        </h2>
        <div className="h-12">
        </div>
      </div>
    </div>

  )
}

export default ItemCardSkeleton;
