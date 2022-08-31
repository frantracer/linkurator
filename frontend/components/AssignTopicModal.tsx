import CustomButton from "./CustomButton";
import React, {useState} from "react";
import {assignSubscriptionToTopic, createTopic} from "../services/topicService";
import {Topic} from "../entities/Topic";
import {Subscription} from "../entities/Subscription";
import {v4 as uuidv4} from 'uuid';

export const AssignTopicModalId = "assign-topic-modal";

type AssignTopicModalProps = {
  topics: Topic[];
  subscription: Subscription;
  refreshTopics: () => void;
}

const EditTopicModal = (props: AssignTopicModalProps) => {
  const [topicName, setTopicName] = useState<string>("");
  const [selectedTopicId, setselectedTopicId] = useState<string>("0");

  const options = props.topics.map(topic => {
    return <option key={topic.uuid} value={topic.uuid}>{topic.name}</option>
  })

  function assignButtonAction() {
    assignSubscriptionToTopic(selectedTopicId, props.subscription.uuid)
      .then(() => props.refreshTopics())
      .catch(err => console.log(err));
  }

  function newTopicButtonAction(topic_name: string) {
    if (topic_name.length > 0) {
      const new_uuid = uuidv4();
      createTopic(new_uuid, topic_name, [])
        .then(() => {
          props.refreshTopics();
          setselectedTopicId(new_uuid);
        })
        .catch(err => console.log(err));
    }
  }

  return (
    <div className="text-white">
      <input type="checkbox" id={AssignTopicModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{"Assign topic to subscription " + props.subscription.name}</h3>
          <div className="form-control w-full max-w-xs">
            <div className="input-group">
              <label className="label">
                <span className="label-text">Topic name</span>
              </label>
              <input type="text" placeholder="Topic name" className="input input-bordered w-full max-w-xs"
                     value={topicName} onChange={(e) => setTopicName(e.target.value)}/>
              <CustomButton text={"Create"} icon={undefined} relatedModalId={undefined}
                            clickAction={() => newTopicButtonAction(topicName)}/>
            </div>
          </div>
          <div className="form-control">
            <div className="input-group">
              <select className="select select-bordered" value={selectedTopicId}
                      onChange={e => setselectedTopicId(e.target.value)}>
                <option disabled value={"0"}>Pick topic</option>
                {options}
              </select>
              <CustomButton text={"Assign"} icon={undefined} relatedModalId={undefined}
                            clickAction={assignButtonAction}/>
            </div>
          </div>
          <div className="modal-action">
            <CustomButton text={"Close"} icon={undefined} relatedModalId={AssignTopicModalId}
                          clickAction={() => {
                          }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditTopicModal;