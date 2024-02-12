type SectionProps = {
  id?: string,
  children?: React.ReactNode
}

const Head1 = ({id, children}: SectionProps) => {
  return (
    <section id={id} className="m-2 p-2">
      {children}
    </section>)
}

export default Head1;
