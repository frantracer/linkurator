import {SectionType} from "../entities/SectionType";

type SectionSelectorProps = {
  section: SectionType;
  setSection: (section: SectionType) => void;
}

const SectionDropdown = (props: SectionSelectorProps) => {
  const options = [
    {label: 'Subscriptions', value: SectionType.Subscriptions},
    {label: 'Topics', value: SectionType.Topics}
  ];

  return (
    <select className="select select-primary text-black bg-white w-full max-w-xs focus:outline-0"
            onChange={(e) => props.setSection(e.target.value as SectionType)}>
      {options.map(option => (
        <option selected={props.section === option.value} key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export default SectionDropdown;