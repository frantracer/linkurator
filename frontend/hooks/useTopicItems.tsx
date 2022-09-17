import {useEffect, useState} from "react";
import {getTopicItems, getTopicItemsFromUrl} from "../services/topicService";
import {SubscriptionItem} from "../entities/SubscriptionItem";

type OptionalTopicId = string | undefined;

type NextPageLogic = {
  currentTopicId: OptionalTopicId,
  lastTopicId: OptionalTopicId,
  nextUrl: string | undefined,
  loading: boolean,
}

const useTopicItems = (): [SubscriptionItem[], boolean, () => void, OptionalTopicId, (newTopicId: OptionalTopicId) => void] => {
  const [topicItems, setTopicItems] = useState<SubscriptionItem[]>([]);
  const [nextPageLogic, setNextPageLogic] = useState<NextPageLogic>({
    currentTopicId: undefined,
    lastTopicId: undefined,
    nextUrl: undefined,
    loading: false,
  });

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
          });
        })
        .catch(error => console.log("Error retrieving topic items " + error));
      return;
    }
  }

  useEffect(() => {
    const drawerContent = document.querySelector('.drawer-content');

    const handleTopicScroll = () => {
      if (drawerContent && nextPageLogic.currentTopicId && !nextPageLogic.loading) {
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
    nextPageLogic.currentTopicId,
    (topicId: OptionalTopicId) => setNextPageLogic({...nextPageLogic, currentTopicId: topicId, loading: true})
  ];
}


export default useTopicItems;
