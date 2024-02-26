type MiniatureProps = {
  src: string;
  alt: string;
}

const Miniature = (props: MiniatureProps) => {
  return (
    <div className="avatar">
      <div className="w-5 h-5 rounded bg-neutral">
        <img src={props.src} alt={props.alt}/>
      </div>
    </div>
  )
}

export default Miniature;
