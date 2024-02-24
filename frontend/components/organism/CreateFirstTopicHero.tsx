import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";

const CreateFirstTopicHero = () => {
  return (
    <div className="hero min-h-screen bg-gray-200 text-black">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <p className="text-5xl font-bold">It is time to create your first topic!</p>
          <p className="py-2">Choose some of your subscriptions and group them into a topic</p>
          <Button relatedModalId={NewTopicModalId}>
            <AddIcon/>
            <span>New Topic</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateFirstTopicHero;
