import {Subscription} from "../entities/Subscription";

type VideoCardProps = {
  img: string;
  name: string;
  description: string;
  url: string;
  subscription?: Subscription;
};

const VideoCard = (props: VideoCardProps) => {
  const {img, name, description} = props;
  return (
    <div className="card card-compact w-64 md:w-80 text-black shadow-xl hover:scale-105 cursor-pointer">
      <figure><img className="w-full" src={img} alt={name} onClick={() => window.open(props.url, "_blank")}/></figure>
      <div className="card-body">
        <h2 className="card-title">{name}</h2>
        {props.subscription &&
            <div className="flex items-center">
              <img className="w-4 h-4 inline-block mx-1 rounded" src={props.subscription.thumbnail} alt={props.subscription.name}/>
              <p>{props.subscription.name}</p>
            </div>}
        <p>{description}</p>
      </div>
    </div>
  );
};

export default VideoCard;
