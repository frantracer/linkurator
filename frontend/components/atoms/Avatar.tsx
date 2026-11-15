type AvatarProps = {
  src: string;
  alt: string;
  size?: "sm" | "lg";
  badgeImage?: string;
}

const sizeClasses = {
  sm: "w-10 h-10 rounded-md",
  lg: "w-14 h-14 rounded-xl",
};

const Avatar = ({src, alt, size = "sm", badgeImage}: AvatarProps) => {
  return (
    <div className="avatar flex shrink-0">
      <div className={`${sizeClasses[size]} bg-neutral`}>
        {src && <img className="block" src={src} alt={alt}/>}
      </div>
      {badgeImage && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4">
          <img src={badgeImage} alt="" className="rounded-full object-cover w-full h-full"/>
        </div>
      )}
    </div>
  )
}

export default Avatar;
