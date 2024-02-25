type MiniatureProps = {
  src: string;
  alt: string;
}

const Miniature = (props: MiniatureProps) => {
  return (
    <div className="avatar">
      <div className="w-6 h-6 rounded bg-neutral p-0.5">
        <img src={props.src} alt={props.alt}/>
      </div>
    </div>
  )
}

export default Miniature;
