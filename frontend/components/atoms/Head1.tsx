type Head1Props = {
  id?: string,
  children?: React.ReactNode
}

const Head1 = ({id, children}: Head1Props) => {
    return (
      <h1 id={id} className="text-2xl md:text-4xl font-bold py-2">
        {children}
      </h1>)
}

export default Head1;
