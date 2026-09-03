import {SectionType} from "../../entities/SectionType";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";

type SectionSelectorProps = {
  section: SectionType;
  setSection: (section: SectionType) => void;
}

const SectionDropdown = (props: SectionSelectorProps) => {
  const options = [
    {label: 'Topics', value: SectionType.Topics},
    {label: 'Subscriptions', value: SectionType.Subscriptions}
  ];

  return (
    <select className="select select-primary text-black bg-white w-full max-w-xs focus:outline-0"
            onChange={(e) => {props.setSection(e.target.value as SectionType); scrollToDrawerTop()}}>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export default SectionDropdown;
