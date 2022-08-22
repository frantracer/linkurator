import CustomButton from "./atoms/CustomButton";
import React from "react";

export const NewTopicModalId = "new-topic-modal";

const NewTopicModal = () => {
  return (
    <div className="text-white">
      <input type="checkbox" id={NewTopicModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create new topic</h3>
          <p className="py-4">Form</p>
          <div className="modal-action">
            <CustomButton text={"Close"} icon={undefined} relatedModalId={NewTopicModalId} clickAction={() => {
            }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTopicModal;