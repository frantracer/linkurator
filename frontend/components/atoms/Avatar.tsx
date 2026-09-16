type AvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10 rounded-md",
  lg: "w-14 h-14 rounded-xl",
};

const Avatar = ({src, alt, size = "sm"}: AvatarProps) => {
  return (
    <div className="avatar flex shrink-0">
      <div className={`${sizeClasses[size]} bg-neutral`}>
        {src && <img className="block" src={src} alt={alt}/>}
      </div>
    </div>
  )
}

export default Avatar;
