import CustomButton from "../atoms/CustomButton";
import React, {useState} from "react";
import {createTopic} from "../../services/topicService";
import {v4 as uuidv4} from 'uuid';
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {Subscription} from "../../entities/Subscription";

export const NewTopicModalId = "new-topic-modal";

type NewTopicModalProps = {
  subscriptions: Subscription[];
  refreshTopics: () => void;
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>("0")
  const [subscriptionsToAdd, addSubscription, removeSubscription, clearSubscriptions] = useSubscriptionsToAdd([], undefined)

  const options = props.subscriptions.map(subscription => {
    return <option key={subscription.uuid} value={subscription.uuid}>{subscription.name}</option>
  })

  const subscriptionBadges = subscriptionsToAdd.map(s => subscriptionToBadge(s, removeSubscription))

  return (
    <div className="text-white">
      <input type="checkbox" id={NewTopicModalId} className="modal-toggle"/>
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create new topic</h3>
          <div className="form-control w-3/4 max-w-xs my-2 ">
            <input type="text" placeholder="New topic name" className="input input-bordered w-full max-w-xs"
                   value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)}/>
          </div>
          <div className="form-control my-2">
            <div className="input-group w-3/4">
              <select className="select select-bordered w-full max-w-xs" value={selectedSubscriptionId}
                      onChange={e => setSelectedSubscriptionId(e.target.value)}>
                <option disabled value={"0"}>Pick subscription</option>
                {options}
              </select>
              <button className="btn w-1/4" onClick={() => {
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
            <form method="dialog">
              <label htmlFor={NewTopicModalId}
                     className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</label>
              <CustomButton text={"Create"} icon={undefined} relatedModalId={NewTopicModalId}
                            clickAction={async () => {
                              await createTopic(uuidv4(), newTopicName, subscriptionsToAdd.map(s => s.uuid));
                              props.refreshTopics();
                              clearSubscriptions();
                              setNewTopicName("");
                            }}/>
            </form>
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

export default NewTopicModal;
