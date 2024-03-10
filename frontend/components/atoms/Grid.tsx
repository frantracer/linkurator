type GridProps = {
  children: React.ReactNode;
}

const Grid = ({children}: GridProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {children}
    </div>
  );
}

export default Grid;
