type MiniatureProps = {
  src: string;
  alt: string;
}

const Miniature = (props: MiniatureProps) => {
  return (
    <div className="avatar">
      <div className="w-4 h-4 rounded bg-neutral">
        <img src={props.src} alt={props.alt}/>
      </div>
    </div>
  )
}

export default Miniature;
