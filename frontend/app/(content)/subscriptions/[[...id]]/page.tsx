import type {Metadata} from 'next';
import {getSubscription} from '../../../../services/subscriptionService';
import SubscriptionPageComponent from './components/SubscriptionPage';
import SubscriptionsListPageComponent from './components/SubscriptionsListPage';

type SubscriptionPageParams = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  {params}: SubscriptionPageParams,
): Promise<Metadata> {
  const id = (await params).id;
  const defaultTitle = 'Linkurator';
  let title = defaultTitle;

  if (id) {
    const subscription = await getSubscription(id)
    title = subscription ? subscription.name : defaultTitle;
  }

  return {
    title: title,
  }
}

export default async function SubscriptionPage({params}: SubscriptionPageParams) {
  const {id} = await params;
  if (!id) {
    return <SubscriptionsListPageComponent/>
  }
  return <SubscriptionPageComponent subscriptionId={id}/>
}
