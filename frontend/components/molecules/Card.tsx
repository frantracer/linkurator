type CardProps = {
  title: string;
  children: React.ReactNode;
}

const Card = (props: CardProps) => {
  return (
    <div className="card bg-base-200 w-[300px] shadow-sm">
      <div className="card-body rounded-2xl">
        <h2 className="card-title">{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
}

export default Card;