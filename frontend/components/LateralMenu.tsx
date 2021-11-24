const Title = () => (
  <div className="flex-shrink-0 px-8 py-4 flex flex-row items-center justify-between">
    <a
      href="#"
      className="text-lg font-semibold tracking-widest text-gray-900 uppercase rounded-lg focus:outline-none focus:shadow-outline"
    >
      Linkurator
    </a>
    <button className="rounded-lg md:hidden focus:outline-none focus:shadow-outline">
      Linkurator
    </button>
  </div>
);

const MenuItem = (props: { title: string }) => (
  <a
    className="block px-4 py-2 mt-2 text-sm font-semibold text-gray-900 rounded-lg hover:bg-blue-400 focus:bg-blue-400 focus:outline-none focus:shadow-outline"
    href="#"
  >
    {props.title}
  </a>
);

type LateralMenuProps = {
  items: string[];
};

const LateralMenu = (props: LateralMenuProps) => {
  const items = props.items.map((item, index) => (
    <MenuItem title={item} key={index} />
  ));

  return (
    <div className="md:flex flex-col md:flex-row md:min-h-screen w-full bg-white">
      <div className="flex flex-col w-full md:w-64 text-gray-700 bg-blue-300 flex-shrink-0">
        <Title />
        <nav className="flex-grow md:block px-4 pb-4 md:pb-0 md:overflow-y-auto">
          {items}
        </nav>
      </div>
    </div>
  );
};

export default LateralMenu;
