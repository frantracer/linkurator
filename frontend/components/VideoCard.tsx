type VideoCardProps = {
  img: string;
  name: string;
  description: string;
  url: string;
};

const VideoCard = (props: VideoCardProps) => {
  const { img, name, description } = props;
  return (
    <div className="flex flex-col items-center justify-center transition-transform transform bg-white rounded-lg shadow-lg md:w-64 hover:scale-105">
      <div
        onClick={() => window.open(props.url, "_blank")}
        className="w-full bg-center bg-no-repeat bg-cover rounded-t-lg"
        data-testid="video-card-image"
        style={{
          backgroundImage: `url(${img})`,
          maxHeight: "200px",
          minHeight: "200px",
          minWidth: "200px",
        }}
      ></div>
      <div className="flex flex-col justify-start w-full p-4">
        <h4 className="text-3xl border-b-2">{name}</h4>
        <p className="my-4">{description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
