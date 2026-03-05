type AvatarProps = {
  src: string;
  alt: string;
}

const Avatar = (props: AvatarProps) => {
  return (
    <div className="avatar flex">
      <div className="w-12 h-12 rounded-md bg-neutral">
        {props.src && <img className="block" src={props.src} alt={props.alt}/>}
      </div>
    </div>
  )
}

export default Avatar;
