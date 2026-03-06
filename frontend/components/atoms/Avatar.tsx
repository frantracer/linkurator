type AvatarProps = {
  src: string;
  alt: string;
}

const Avatar = ({src, alt}: AvatarProps) => {
  return (
    <div className="avatar flex">
      <div className={`w-10 h-10 rounded-md bg-neutral`}>
        {src && <img className="block" src={src} alt={alt}/>}
      </div>
    </div>
  )
}

export default Avatar;
