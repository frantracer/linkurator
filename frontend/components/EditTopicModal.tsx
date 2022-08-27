import CustomButton from "./CustomButton";
import React, {useState} from "react";
import {getTopicItems, getTopics, updateTopic} from "../services/topicService";
import {Topic} from "../entities/Topic";
import {Subscription} from "../hooks/useSubscriptions";
import useSubscriptionsToAdd from "../hooks/useSubscriptionsToAdd";
import {TopicItem} from "../entities/TopicItem";
import {useTopicName} from "../hooks/useTopicName";

export const EditTopicModalId = "update-topic-modal";

type EditTopicModalProps = {
  topic: Topic;
  subscriptions: Subscription[];
  setTopics: (topics: Topic[]) => void;
  setTopicItems: (topicItems: TopicItem[]) => void;
}

async function editAndGetTopics(topic_id: string, topicName: string | undefined, subscriptionsIds: string[] | undefined) {
  await updateTopic(topic_id, topicName, subscriptionsIds);
  return await getTopics();
}

const EditTopicModal = (props: EditTopicModalProps) => {
  const [topicName, setTopicName] = useTopicName(props.topic);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("0")
  const [subscriptionsToAdd, addSubscription, removeSubscription] = useSubscriptionsToAdd(props.subscriptions, props.topic)

  const options = props.subscriptions.map(subscription => {
    return <option key={subscription.uuid} value={subscription.uuid}>{subscription.name}</option>
  })

  const subscriptionBadges = subscriptionsToAdd.map(s => subscriptionToBadge(s, removeSubscription))

  async function editButtonAction() {
    editAndGetTopics(props.topic.uuid, topicName, subscriptionsToAdd.map(s => s.uuid))
      .then(props.setTopics)
      .catch(error => console.log(error))
    props.setTopicItems(await getTopicItems(props.topic.uuid))
  }

  return (
    <div className="text-white">
      <input type="checkbox" id={EditTopicModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{"Edit topic " + props.topic.name}</h3>
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text">Topic name</span>
            </label>
            <input type="text" placeholder="Topic name" className="input input-bordered w-full max-w-xs"
                   value={topicName} onChange={(e) => setTopicName(e.target.value)}/>
          </div>
          <div className="form-control">
            <div className="input-group">
              <select className="select select-bordered" value={selectedSubscriptionId}
                      onChange={e => setSelectedSubscriptionId(e.target.value)}>
                <option disabled value={"0"}>Pick subscription</option>
                {options}
              </select>
              <button className="btn" onClick={() => {
                const subscription = props.subscriptions.find(subscription => subscription.uuid === selectedSubscriptionId);
                if (subscription && !subscriptionsToAdd.map(s => s.uuid).includes(subscription.uuid)) {
                  addSubscription(subscription);
                }
              }}>
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-wrap">
            {subscriptionBadges}
          </div>
          <div className="modal-action">
            <CustomButton text={"Close"} icon={undefined} relatedModalId={EditTopicModalId}
                          clickAction={() => {
                          }}/>
            <CustomButton text={"Edit"} icon={undefined} relatedModalId={EditTopicModalId}
                          clickAction={editButtonAction}/>
          </div>
        </div>
      </div>
    </div>
  )
}


function subscriptionToBadge(subscription: Subscription, removeSubscription: (subscription: Subscription) => void) {
  return <div key={subscription.uuid} className="badge mx-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         className="inline-block w-4 h-4 stroke-current cursor-pointer"
         onClick={() => removeSubscription(subscription)}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
    {subscription.name}
  </div>
}

export default EditTopicModal;