import {useEffect, useState} from "react";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {getItem, getSubscriptionItems, getSubscriptionItemsFromUrl} from "../services/subscriptionService";

type OptionalSubscriptionId = string | undefined;

type NextPageLogic = {
  currentSubscriptionId: OptionalSubscriptionId,
  lastSubscriptionId: OptionalSubscriptionId,
  nextUrl: string | undefined,
  clean: boolean,
  loading: boolean,
  isFinished: boolean,
}


const useSubscriptionItems = (): [
  SubscriptionItem[],
  boolean,
  () => void,
  (itemId: string) => void,
  OptionalSubscriptionId,
  (selectedSubscriptionId: OptionalSubscriptionId) => void,
  boolean
] => {
  const [subscriptionsItems, setSubscriptionsItems] = useState<SubscriptionItem[]>([]);
  const [nextPageLogic, setNextPageLogic] = useState<NextPageLogic>({
    currentSubscriptionId: undefined,
    lastSubscriptionId: undefined,
    nextUrl: undefined,
    clean: true,
    loading: false,
    isFinished: false,
  });

  function refreshSubscriptionItem(itemId: string) {
    if (subscriptionsItems.map(item => item.uuid).includes(itemId)) {
      getItem(itemId).then((updatedItem) => {
        if (updatedItem) {
          const newSubscriptionsItems = subscriptionsItems.map((item) => {
              if (item.uuid == itemId) {
                return updatedItem;
              } else {
                return item;
              }
            }
          )
          setSubscriptionsItems(newSubscriptionsItems);
        }
      })
    }
  }

  function refreshSubscriptionItems() {
    if (!nextPageLogic.loading) {
      return;
    }

    if (!nextPageLogic.currentSubscriptionId) {
      setSubscriptionsItems([]);
      setNextPageLogic({
        ...nextPageLogic,
        currentSubscriptionId: nextPageLogic.currentSubscriptionId,
        lastSubscriptionId: nextPageLogic.currentSubscriptionId,
        loading: false
      })
      return;
    }

    if (nextPageLogic.currentSubscriptionId && nextPageLogic.currentSubscriptionId !== nextPageLogic.lastSubscriptionId) {
      getSubscriptionItems(nextPageLogic.currentSubscriptionId)
        .then(([items, nextUrl]) => {
          setSubscriptionsItems(items);
          setNextPageLogic({
            currentSubscriptionId: nextPageLogic.currentSubscriptionId,
            lastSubscriptionId: nextPageLogic.currentSubscriptionId,
            nextUrl: nextUrl,
            clean: false,
            loading: false,
            isFinished: !nextUrl,
          });
        })
        .catch(error => console.log("Error retrieving subscription items " + error));
      return;
    }

    if (nextPageLogic.nextUrl && nextPageLogic.loading) {
      getSubscriptionItemsFromUrl(nextPageLogic.nextUrl)
        .then(([items, nextUrl]) => {
          setSubscriptionsItems([...subscriptionsItems, ...items]);
          setNextPageLogic({
            currentSubscriptionId: nextPageLogic.currentSubscriptionId,
            lastSubscriptionId: nextPageLogic.lastSubscriptionId,
            nextUrl: nextUrl,
            clean: false,
            loading: false,
            isFinished: !nextUrl,
          });
        })
        .catch(error => console.log("Error retrieving subscription items " + error));
      return;
    }
  }

  useEffect(() => {
    const drawerContent = document.querySelector('.drawer-content');

    const handleSubscriptionScroll = () => {
      if (drawerContent && nextPageLogic.currentSubscriptionId && !nextPageLogic.loading && !nextPageLogic.isFinished) {
        if (drawerContent.scrollTop + drawerContent.clientHeight >= drawerContent.scrollHeight) {
          setNextPageLogic({...nextPageLogic, loading: true});
        }
      }
    }

    handleSubscriptionScroll();

    if (drawerContent) {
      drawerContent.addEventListener('scroll', handleSubscriptionScroll);
    }

    refreshSubscriptionItems();

    return () => drawerContent?.removeEventListener('scroll', handleSubscriptionScroll);
  }, [nextPageLogic]);

  return [
    subscriptionsItems,
    nextPageLogic.loading,
    () => refreshSubscriptionItems(),
    (itemId: string) => refreshSubscriptionItem(itemId),
    nextPageLogic.currentSubscriptionId,
    (selectedSubscriptionId: OptionalSubscriptionId) => {
      setNextPageLogic({
        currentSubscriptionId: selectedSubscriptionId,
        lastSubscriptionId: nextPageLogic.currentSubscriptionId,
        nextUrl: undefined,
        clean: true,
        loading: true,
        isFinished: false,
      })
    },
    nextPageLogic.isFinished
  ];
};

export default useSubscriptionItems;
