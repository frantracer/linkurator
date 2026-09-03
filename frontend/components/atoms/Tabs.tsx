import {useState} from "react";

export type TabsProps = {
  tabsText: string[];
  selectedTab: string;
  onTabSelected: (tab: string) => void;
}

export const Tabs = (props: TabsProps) => {
  const [selectedTab, setSelectedTab] = useState(props.selectedTab);

  const handleTabSelected = (tab: string) => {
    setSelectedTab(tab);
    props.onTabSelected(tab);
  }

  return <div role="tablist" className="tabs tabs-bordered w-full mb-6 mt-2 gap-2">
    {
      props.tabsText.map(
        tabText => {
          const isSelected = selectedTab === tabText;
          const selectedClass = isSelected ? "tab-active" : "";
          return <a key={tabText} role="tab" className={`tab ${selectedClass}`}
                    onClick={() => handleTabSelected(tabText)}>{tabText}
          </a>
        })}
  </div>
}
