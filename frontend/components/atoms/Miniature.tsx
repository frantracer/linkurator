type MiniatureProps = {
  src: string;
  alt: string;
  badgeImage?: string;
}

const Miniature = (props: MiniatureProps) => {
  return (
    <div className="avatar">
      <div className="w-5 h-5 rounded">
        <img src={props.src} alt={props.alt}/>
      </div>
      {props.badgeImage && (
        <div className="absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3 w-4 h-4">
          <img
            src={props.badgeImage}
            alt="Badge"
            className="rounded-full object-cover w-full h-full border border-gray-300 bg-white"
          />
        </div>
      )}
    </div>
  )
}

export default Miniature;
