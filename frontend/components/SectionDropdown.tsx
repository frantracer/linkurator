import {SectionType} from "../entities/SectionType";

type SectionSelectorProps = {
  section: SectionType;
  setSection: (section: SectionType) => void;
}

const SectionDropdown = (props: SectionSelectorProps) => {
  const options = [
    { label: 'Subscriptions', value: SectionType.Subscriptions },
    { label: 'Topics', value: SectionType.Topics }
  ];

  return (
    <div>
      <select className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline" onChange={(e) => props.setSection(e.target.value as SectionType)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default SectionDropdown;