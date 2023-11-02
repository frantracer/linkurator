type LateralSearchBarProps = {
  searchBarQuery: string;
  setSearchBarQuery: (subscription: string) => void;
};

const LateralSearchBar = (props: LateralSearchBarProps) => (
  <div className="flex flex-row items-center justify-between px-4 py-2">
    <input
      className="input w-full max-w-xs input-primary bg-white"
      type="text"
      placeholder="Search"
      value={props.searchBarQuery}
      onChange={(e) => props.setSearchBarQuery(e.target.value)}
    />
  </div>
);

export default LateralSearchBar;
