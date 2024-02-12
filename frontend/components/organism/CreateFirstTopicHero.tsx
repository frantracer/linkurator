import CustomButton, {IconForButton} from "../atoms/CustomButton";
import {NewTopicModalId} from "./NewTopicModal";
import React from "react";

const CreateFirstTopicHero = () => {
  return (
    <div className="hero min-h-screen bg-gray-200 text-black">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-5xl font-bold">It is time to create your first topic!</p>
          <p className="py-2">Choose some of your subscriptions and group them into a topic</p>
          <CustomButton
            text={"New Topic"}
            icon={IconForButton.add}
            relatedModalId={NewTopicModalId}
            clickAction={() => {
            }}/>
        </div>
      </div>
    </div>
  );
}

export default CreateFirstTopicHero;
