type VideoCardProps = {
  img: string;
  name: string;
  description: string;
  url: string;
};

const VideoCard = (props: VideoCardProps) => {
  const { img, name, description } = props;
  return (
    <div className="card card-compact w-64 md:w-80 text-black shadow-xl hover:scale-105 cursor-pointer">
      <figure><img className="w-full" src={img} alt={name} onClick={() => window.open(props.url, "_blank")}/></figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
