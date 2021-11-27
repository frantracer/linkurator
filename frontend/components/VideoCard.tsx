import Image from "next/image";

type VideoCardProps = {
  img: string;
  name: string;
  description: string;
};

const VideoCard = (props: VideoCardProps) => {
  const { img, name, description } = props;
  return (
    <div className="flex flex-col items-center justify-center transition-transform transform bg-white rounded-lg shadow-lg md:w-64 hover:scale-105">
      <div className="justify-center overflow-hidden ">
        <img
          src={img}
          alt="img"
          title="img"
          className="rounded-t-lg w-max h-max object-fit"
          style={{ maxHeight: "200px", minHeight: "200px" }}
        />
      </div>
      <div className="flex flex-col justify-start w-full p-4">
        <h4 className="text-3xl border-b-2" id="whoobe-3mr7n">
          {name}
        </h4>
        <p className="my-4">{description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
