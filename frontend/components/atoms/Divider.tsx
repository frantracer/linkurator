type DividerProps = {
  text?: string;
}

const Divider = (props: DividerProps) => {
  return <div className="divider m-0 h-fit">{props?.text}</div>
}

export default Divider;
