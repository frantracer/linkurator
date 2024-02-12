import React from "react";
import {Subscription} from "../../entities/Subscription";
import Link from "next/link";
import {paths} from "../../configuration";

type SubscriptionTagProps = {
  subscription: Subscription;
}

const SubscriptionTag = ({subscription}: SubscriptionTagProps) => {
  return <div className="badge badge-outline mx-2">
    <img className="w-4 h-4 inline-block mx-1 rounded" src={subscription.thumbnail} alt={subscription.name}/>
    <Link href={paths.SUBSCRIPTIONS + "/" + subscription.uuid} scroll={false}>
      {subscription.name}
    </Link>
  </div>
}

export default SubscriptionTag;
