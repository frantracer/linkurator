import { MenuItem } from "./MenuItem";
import useTopics from "../hooks/useTopics";
import { useState } from "react";

type LateralMenuProps = {
  onClickTopic: (topicId: string) => void;
};

const Title = () => (
  <div className="flex flex-row items-center justify-between flex-shrink-0 px-8 py-4">
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

const LateralMenu = (props: LateralMenuProps) => {
  const topics = useTopics();
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const handleClick = (topicId: string) => {
    setSelectedTopic(topicId);
    props.onClickTopic(topicId);
  };

  const items = topics.map((topic) => (
    <MenuItem
      title={topic.name}
      key={topic.id}
      onClick={() => handleClick(topic.id)}
      selected={topic.id === selectedTopic}
    />
  ));

  return (
    <div className="sticky top-0 flex-col h-screen bg-white shadow-lg md:flex md:flex-row">
      <div className="flex flex-col flex-shrink-0 w-full text-gray-700 bg-white md:w-64">
        <div className="flex flex-row justify-between py-4 px-7">
          <h2 className="text-2xl font-bold">Ruben</h2>
          <div className="flex">
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-2 w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <img
              className="inline-block w-8 h-8 rounded-full ring-1 ring-white"
              src="https://lh3.googleusercontent.com/a-/AOh14Gg16Z9DCQfFWPpsnO7ULEv_c7tvMo-_uFcpMTq8pA=s576-p-rw-no"
              alt=""
            />
          </div>
        </div>
        <nav className="flex-grow pb-4 px-7 md:block md:pb-0 md:overflow-y-auto">
          {items}
        </nav>
      </div>
    </div>
  );
};

export default LateralMenu;
