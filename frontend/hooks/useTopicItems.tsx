import {useEffect, useState} from "react";
import {getTopicItems, getTopicItemsFromUrl} from "../services/topicService";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {getItem} from "../services/subscriptionService";

type OptionalTopicId = string | undefined;

type NextPageLogic = {
  currentTopicId: OptionalTopicId,
  lastTopicId: OptionalTopicId,
  nextUrl: string | undefined,
  loading: boolean,
  isFinished: boolean,
}

const useTopicItems = (): [
  SubscriptionItem[],
  boolean,
  () => void,
  (item_uuid: string) => void,
  OptionalTopicId,
  (newTopicId: OptionalTopicId) => void,
  boolean
] => {
  const [topicItems, setTopicItems] = useState<SubscriptionItem[]>([]);
  const [nextPageLogic, setNextPageLogic] = useState<NextPageLogic>({
    currentTopicId: undefined,
    lastTopicId: undefined,
    nextUrl: undefined,
    loading: false,
    isFinished: false,
  });

  function refreshTopicItem(itemId: string) {
    if (topicItems.map(item => item.uuid).includes(itemId)) {
      getItem(itemId).then((updatedItem) => {
        if (updatedItem) {
          const newTopicItems = topicItems.map((item) => {
              if (item.uuid == itemId) {
                return updatedItem;
              } else {
                return item;
              }
            }
          )
          setTopicItems(newTopicItems);
        }
      })
    }
  }

  function refreshTopicItems() {
    if (!nextPageLogic.loading) {
      return;
    }

    if (!nextPageLogic.currentTopicId) {
      setTopicItems([]);
      setNextPageLogic({
        ...nextPageLogic,
        currentTopicId: nextPageLogic.currentTopicId,
        lastTopicId: nextPageLogic.currentTopicId,
        loading: false
      })
      return;
    }

    if (nextPageLogic.currentTopicId && nextPageLogic.currentTopicId !== nextPageLogic.lastTopicId) {
      getTopicItems(nextPageLogic.currentTopicId)
        .then(([items, nextUrl]) => {
          setTopicItems(items);
          setNextPageLogic({
            currentTopicId: nextPageLogic.currentTopicId,
            lastTopicId: nextPageLogic.currentTopicId,
            nextUrl: nextUrl,
            loading: false,
            isFinished: !nextUrl,
          });
        })
        .catch(error => console.log("Error retrieving topic items " + error));
      return;
    }

    if (nextPageLogic.nextUrl && nextPageLogic.loading) {
      getTopicItemsFromUrl(nextPageLogic.nextUrl)
        .then(([items, nextUrl]) => {
          setTopicItems([...topicItems, ...items]);
          setNextPageLogic({
            currentTopicId: nextPageLogic.currentTopicId,
            lastTopicId: nextPageLogic.lastTopicId,
            nextUrl: nextUrl,
            loading: false,
            isFinished: !nextUrl,
          });
        })
        .catch(error => console.log("Error retrieving topic items " + error));
      return;
    }
  }

  useEffect(() => {
    const drawerContent = document.querySelector('.drawer-content');

    const handleTopicScroll = () => {
      if (drawerContent && nextPageLogic.currentTopicId && !nextPageLogic.loading && !nextPageLogic.isFinished) {
        if (drawerContent.scrollTop + drawerContent.clientHeight >= drawerContent.scrollHeight) {
          setNextPageLogic({...nextPageLogic, loading: true});
        }
      }
    }

    handleTopicScroll();

    if (drawerContent) {
      drawerContent.addEventListener('scroll', handleTopicScroll);
    }

    refreshTopicItems();

    return () => drawerContent?.removeEventListener('scroll', handleTopicScroll);
  }, [nextPageLogic]);

  return [
    topicItems,
    nextPageLogic.loading,
    () => setNextPageLogic({...nextPageLogic, loading: true}),
    (item_uuid: string) => refreshTopicItem(item_uuid),
    nextPageLogic.currentTopicId,
    (topicId: OptionalTopicId) => setNextPageLogic({...nextPageLogic, currentTopicId: topicId, loading: true}),
    nextPageLogic.isFinished
  ];
}


export default useTopicItems;
