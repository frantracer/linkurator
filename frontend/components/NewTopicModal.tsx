import CustomButton from "./atoms/CustomButton";
import React, {useState} from "react";
import {createTopic, getTopics} from "../services/topicService";
import { v4 as uuidv4 } from 'uuid';
import {Topic} from "../entities/Topic";

export const NewTopicModalId = "new-topic-modal";

type NewTopicModalProps = {
  setTopics: (topics: Topic[]) => void;
}

async function createAndGetTopics(topicName: string) {
    await createTopic(uuidv4(), topicName, []);
    return await getTopics();
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const [newTopicName, setNewTopicName] = useState("");

  return (
    <div className="text-white">
      <input type="checkbox" id={NewTopicModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create new topic</h3>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">New topic name</span>
            </label>
            <input type="text" placeholder="New Topic" className="input input-bordered w-full max-w-xs"
                   value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}/>
          </div>
          <div className="modal-action">
            <CustomButton text={"Close"} icon={undefined} relatedModalId={NewTopicModalId}
                          clickAction={() => {}}/>
            <CustomButton text={"Create"} icon={undefined} relatedModalId={NewTopicModalId}
                          clickAction={async () => {
                            createAndGetTopics(newTopicName)
                              .then(props.setTopics)
                              .catch(error => console.log(error))
                          }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewTopicModal;