
type FlexItemProps = {
  shrink?: boolean;
  grow?: boolean;
  whiteSpace?: boolean;
  children?: React.ReactNode;
};

const FlexItem = (
  {
    shrink = false,
    grow = false,
    children
  } : FlexItemProps
) => {
  let className = "";
  if (shrink) {
    className += "shrink ";
  } else {
    className += "shrink-0 ";
  }

  if (grow) {
    className += "grow ";
  } else {
    className += "grow-0 ";
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

export default FlexItem;
